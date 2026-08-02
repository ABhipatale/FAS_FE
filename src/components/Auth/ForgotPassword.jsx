import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle, FiArrowLeft, FiArrowRight, FiCheckCircle, FiMail,
} from 'react-icons/fi';
import API_CONFIG, { apiCall } from '../../config/api';
import AuthCard from './AuthCard';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await apiCall(API_CONFIG.ENDPOINTS.PASSWORD_FORGOT, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || 'Could not send the reset link. Try again.');
      }
    } catch (err) {
      console.error('Forgot password failed:', err);
      setError(err.message || 'Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={
          <>
            If <span className="font-medium text-slate-700">{email}</span> belongs to an account,
            a reset link is on its way. It expires in 60 minutes.
          </>
        }
        footer={
          <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
            Back to sign in
          </Link>
        }
      >
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">Reset link sent.</p>
        </div>

        <button
          type="button"
          onClick={() => { setSent(false); setError(''); }}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Use a different email
        </button>

        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Nothing arrived? Check the spam folder, or ask your administrator to reset it for you.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you sign in with and we'll send you a link to choose a new password."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      }
    >
      {error && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Email address
          </label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              disabled={loading}
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 disabled:bg-slate-50 ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
              }`}
              placeholder="you@company.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
