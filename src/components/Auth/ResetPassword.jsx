import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiAlertCircle, FiArrowRight, FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMail,
} from 'react-icons/fi';
import API_CONFIG, { apiCall } from '../../config/api';
import AuthCard from './AuthCard';

const score = (pwd) => {
  if (!pwd) return 0;
  let n = 0;
  if (pwd.length >= 6) n += 1;
  if (pwd.length >= 10) n += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) n += 1;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) n += 1;
  return n;
};

const STRENGTH = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-lime-500' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

const inputClass = (error) =>
  `w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-sm text-slate-900 shadow-sm outline-none transition
   placeholder:text-slate-400 disabled:bg-slate-50
   ${error
    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
    : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'}`;

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = score(password);

  // A link without both parts can never work - say so instead of failing on submit
  if (!token || !email) {
    return (
      <AuthCard
        title="This link isn't valid"
        subtitle="The reset link is incomplete or has been altered. Request a fresh one and open it directly from the email."
        footer={
          <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
            Back to sign in
          </Link>
        }
      >
        <Link
          to="/forgot-password"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Request a new link
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </AuthCard>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = {};
    if (!password) next.password = 'Choose a new password';
    else if (password.length < 6) next.password = 'Use at least 6 characters';
    if (password !== confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);

    try {
      const { data } = await apiCall(API_CONFIG.ENDPOINTS.PASSWORD_RESET, {
        method: 'POST',
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: confirm,
        }),
      });

      if (data.success) {
        setDone(true);
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      } else if (data.errors?.password) {
        setErrors({
          password: Array.isArray(data.errors.password) ? data.errors.password[0] : data.errors.password,
        });
      } else {
        setErrors({ general: data.message || 'Could not reset your password.' });
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      setErrors({ general: err.message || 'Could not reach the server. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        subtitle="You can sign in with your new password now. Any other device that was signed in has been logged out."
      >
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">Taking you to the sign-in page…</p>
        </div>

        <Link
          to="/login"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Sign in now
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Pick something you don't use anywhere else. The link works once."
      footer={
        <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-700">
          Back to sign in
        </Link>
      }
    >
      {errors.general && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">{errors.general}</p>
        </div>
      )}

      {/* The account being reset - read-only, it comes from the signed link */}
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <FiMail className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate text-sm font-medium text-slate-700">{email}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
            New password
          </label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
              disabled={loading}
              className={inputClass(errors.password)}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {showPwd ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.password}
            </p>
          )}

          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength ? STRENGTH[strength].color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="w-12 text-right text-xs font-medium text-slate-500">
                {STRENGTH[strength].label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirm"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors({}); }}
              disabled={loading}
              className={inputClass(errors.confirm)}
              placeholder="Re-enter the password"
            />
          </div>

          {errors.confirm && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.confirm}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Updating…
            </>
          ) : (
            <>
              Reset password
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
