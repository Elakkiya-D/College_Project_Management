import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const PaymentForm = ({ studentFeeId, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useSelector(state => state.user);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create Payment Intent on our backend
            const { data } = await axios.post(`${BASE_URL}/api/payment/create-intent`, {
                studentFeeId: studentFeeId.toString()
            });

            // 2. Confirm payment on Stripe
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: currentUser.name,
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Confirm server-side and mark as paid (works even without webhooks in dev)
                    await axios.post(`${BASE_URL}/api/payment/confirm`, {
                        studentFeeId: studentFeeId.toString(),
                        paymentIntentId: result.paymentIntent.id,
                    });
                    setLoading(false);
                    onSuccess();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25rem] text-gray-400">Card Registry</label>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                        <LockIcon sx={{ fontSize: 10 }} /> SSL SECURED
                    </div>
                </div>

                <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus-within:border-blue-600 focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-blue-50/50 transition-all group">
                    <CardElement options={cardStyles} />
                </div>
            </div>

            {error && (
                <div className="p-5 bg-red-50/50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-600 animate-slide-up flex items-center gap-4 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 font-bold border border-red-200">!</div>
                    <span className="leading-relaxed">{error}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:flex-1 h-14 rounded-2xl font-bold text-xs uppercase tracking-[0.2rem] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 active:scale-95"
                >
                    Dismiss
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full sm:flex-[2] h-14 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3rem] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 active:scale-95"
                >
                    {loading ? <CircularProgress size={16} color="inherit" strokeWidth={5} /> : (
                        <>
                            Finalize <CreditCardIcon fontSize="inherit" />
                        </>
                    )}
                </button>
            </div>

            <div className="pt-6 flex flex-col items-center gap-4">
                <div className="flex gap-6 grayscale opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4rem] text-gray-300 select-none">ORCHESTRATED BY STRIPE</p>
            </div>
        </form>
    );
};

const cardStyles = {
    style: {
        base: {
            fontSize: '16px',
            color: '#111827',
            fontFamily: 'Instrument Sans, Poppins, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#9ca3af',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

export default PaymentForm;
