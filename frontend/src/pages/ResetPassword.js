import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios, { getApiErrorMessage, getApiUrl } from '../utils/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialEmail = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';
    const role = searchParams.get('role') || 'Admin';
    const loginPath = `/${role}login`;

    const [email, setEmail] = useState(initialEmail);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordHint = useMemo(
        () => 'Use at least 8 characters with uppercase, lowercase, number, and special character.',
        []
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
            setErrorMessage(passwordHint);
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Confirm password must match');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                email: normalizedEmail,
                newPassword,
            };

            if (token) {
                payload.token = token;
            }

            await axios.post(getApiUrl('/auth/reset-password'), payload);

            setSuccessMessage('Password updated successfully. Redirecting to login...');
            setTimeout(() => {
                navigate(loginPath);
            }, 1200);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, 'Unable to reset password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 font-sans">
            <div className="w-full max-w-lg bg-white border border-textDark/10 rounded-2xl shadow-xl p-8 sm:p-10 animate-fade-in">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-textMedium font-semibold">Secure Access</p>
                    <h1 className="text-3xl font-extrabold text-textDark mt-2">Reset Password</h1>
                    <p className="text-textMedium mt-3 leading-relaxed">
                        Create a new secure password for your account.
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

                    <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-bold text-textDark/80">
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Enter new password"
                            className="w-full h-12 px-4 rounded-xl border border-textDark/15 bg-white focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all text-textDark"
                        />
                        <p className="text-xs text-textMedium">{passwordHint}</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-bold text-textDark/80">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full h-12 px-4 rounded-xl border border-textDark/15 bg-white focus:outline-none focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all text-textDark"
                        />
                    </div>

                    {errorMessage && <p className="text-sm text-red-600 font-semibold">{errorMessage}</p>}
                    {successMessage && <p className="text-sm text-brand font-semibold">{successMessage}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-brand text-white font-bold hover:bg-brandDark transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating password...' : 'Reset Password'}
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

export default ResetPassword;
