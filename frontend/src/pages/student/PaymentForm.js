import React, { useState } from 'react';
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create Payment Intent on our backend
            const { data } = await axios.post(`${BASE_URL}/api/payment/create-intent`, { studentFeeId: studentFeeId.toString() });

            // 2. Confirm payment on Stripe
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Student Name', // Should ideally be current user's name
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // Success!
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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card Credentials</label>
                    <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest">
                        <LockIcon sx={{ fontSize: 12 }} /> AES-256 Secured
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group-focus-within:border-accent transition-all shadow-inner">
                    <CardElement options={cardStyles} />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-500 animate-fade-in flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 font-black">!</div>
                    {error}
                </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                >
                    Return
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="flex-[2] h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand hover:shadow-brand/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : (
                        <>
                            Authorize Funds <CreditCardIcon fontSize="small" />
                        </>
                    )}
                </button>
            </div>

            <div className="pt-4 flex flex-col items-center gap-3 opacity-20">
                <div className="flex gap-4 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest">Powered by STRIPE</p>
            </div>
        </form>
    );
};

const cardStyles = {
    style: {
        base: {
            fontSize: '15px',
            color: '#1e293b',
            fontFamily: 'Poppins, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#cbd5e1',
                fontWeight: 'bold',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

export default PaymentForm;
