import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios, { getApiErrorMessage, getApiUrl } from '../utils/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const role = useMemo(() => {
        const roleFromQuery = searchParams.get('role') || 'Admin';
        return roleFromQuery;
    }, [searchParams]);

    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const loginPath = `/${role}login`;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(getApiUrl('/auth/forgot-password'), {
                email: normalizedEmail,
            });

            const responseToken = response?.data?.data?.resetToken;
            const query = new URLSearchParams({
                email: normalizedEmail,
                role,
            });

            if (responseToken) {
                query.set('token', responseToken);
            }

            navigate(`/reset-password?${query.toString()}`);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, 'Unable to process forgot password request'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 font-sans">
            <div className="w-full max-w-lg bg-white border border-textDark/10 rounded-2xl shadow-xl p-8 sm:p-10 animate-fade-in">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-textMedium font-semibold">Password Recovery</p>
                    <h1 className="text-3xl font-extrabold text-textDark mt-2">Forgot Password</h1>
                    <p className="text-textMedium mt-3 leading-relaxed">
                        Enter your email. If the account exists, you can continue to set a new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-textDark/80">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="name@college.edu"
                            className="w-full h-12 px-4 rounded-xl border border-textDark/15 bg-white focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all text-textDark"
                        />
                    </div>

                    {errorMessage && (
                        <p className="text-sm text-red-600 font-semibold">{errorMessage}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-brand text-white font-bold hover:bg-brandDark transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Checking email...' : 'Continue'}
                    </button>

                    <div className="pt-1 text-center">
                        <Link to={loginPath} className="text-sm font-semibold text-brand hover:text-brandDark transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
