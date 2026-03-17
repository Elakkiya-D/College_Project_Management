const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StudentFee = require('../models/studentFeeSchema');

/**
 * STRIPE WEBHOOK HANDLER - /api/webhook
 * Authenticates Stripe events and synchronizes institutional records.
 */
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // 1. Cryptographic Signature Verification
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`⚠️  [Webhook Auth Failed]: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🔔 [Stripe Event Received]: ${event.type}`);

    // 2. Event Orchestration Layer
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { studentFeeId } = session.metadata;

                if (studentFeeId) {
                    await finalizeInstitutionalPayment(studentFeeId, session.id);
                    console.log(`✅ [Checkout Completed]: Fee structure updated for ID ${studentFeeId}`);
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const { studentFeeId } = paymentIntent.metadata;

                if (studentFeeId) {
                    await finalizeInstitutionalPayment(studentFeeId, paymentIntent.id);
                    console.log(`✅ [Payment Intent Succeeded]: ID ${studentFeeId} updated to Paid.`);
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.error(`❌ [Payment Intent Failed]: ID ${paymentIntent.id}. Error: ${paymentIntent.last_payment_error?.message}`);
                // Optional: Update record to 'failed' if tracking that state
                break;
            }

            default:
                console.log(`ℹ️  [Unhandled Event]: ${event.type}`);
        }
    } catch (err) {
        console.error(`🔥 [Database Synchronization Error]: ${err.message}`);
        // We acknowledge reception (200) but log the internal failure
    }

    // 3. Acknowledge Receipt to Stripe
    res.json({ received: true });
};

/**
 * Automate MongoDB reconciliation
 */
const finalizeInstitutionalPayment = async (studentFeeId, stripeId) => {
    return await StudentFee.findByIdAndUpdate(studentFeeId, {
        status: 'paid',
        stripePaymentIntentId: stripeId,
        paidAt: new Date()
    });
};

/**
 * INITIATE PAYMENT FLOW - /api/payment/create-intent
 * Generates a client secret for the frontend Stripe Elements.
 */
const createPaymentIntent = async (req, res) => {
    try {
        const { studentFeeId } = req.body;

        const studentFee = await StudentFee.findById(studentFeeId).populate('feeId');
        if (!studentFee) return res.status(404).json({ message: "Record not found" });

        if (studentFee.status === 'paid') {
            return res.status(400).json({ message: "Obligation already fulfilled" });
        }

        // Attach metadata so the webhook can recover the studentFeeId
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(studentFee.amount * 100), // Amount in Paise/Cents
            currency: 'inr',
            metadata: {
                studentFeeId: studentFeeId.toString()
            }
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(`[Intent Generation Error]: ${error.message}`);
        res.status(500).json({ message: "Server Gateway Error", error: error.message });
    }
};

/**
 * CONFIRM PAYMENT FLOW - /api/payment/confirm
 * Verifies the PaymentIntent server-side and updates the institutional record.
 * Useful for local/dev where webhooks are not configured.
 */
const confirmPaymentIntent = async (req, res) => {
    try {
        const { studentFeeId, paymentIntentId } = req.body;

        if (!studentFeeId || !paymentIntentId) {
            return res.status(400).json({ message: "studentFeeId and paymentIntentId are required" });
        }

        const studentFee = await StudentFee.findById(studentFeeId).populate('feeId');
        if (!studentFee) return res.status(404).json({ message: "Record not found" });

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Basic ownership/metadata check to reduce accidental mismatches
        if (paymentIntent?.metadata?.studentFeeId && paymentIntent.metadata.studentFeeId !== studentFeeId.toString()) {
            return res.status(400).json({ message: "Payment metadata mismatch" });
        }

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: `Payment not succeeded (status: ${paymentIntent.status})` });
        }

        await finalizeInstitutionalPayment(studentFeeId, paymentIntent.id);

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error(`[Payment Confirm Error]: ${error.message}`);
        return res.status(500).json({ message: "Server Gateway Error", error: error.message });
    }
};

module.exports = { createPaymentIntent, confirmPaymentIntent, handleStripeWebhook };
