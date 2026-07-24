import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase, FiMail, FiMapPin, FiPhone, FiUser, FiLock,
  FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiAlertCircle,
  FiCheck, FiCheckCircle, FiShield, FiClock, FiUsers, FiUserCheck, FiAperture,
} from 'react-icons/fi';
import API_CONFIG from '../../config/api';

const STEPS = [
  { id: 1, label: 'Company', hint: 'Organisation details' },
  { id: 2, label: 'Administrator', hint: 'Your login account' },
];

const EMPTY_FORM = {
  company_name: '',
  company_email: '',
  company_address: '',
  company_phone: '',
  admin_name: '',
  admin_email: '',
  admin_password: '',
  confirm_password: '',
  role: 'admin',
};

const passwordScore = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;
  return score;
};

const STRENGTH = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-lime-500' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

/* ---------------------------------------------------------------- Field */

const Field = ({
  id, label, icon: Icon, error, required, hint, children, className = '',
}) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
      <span>
        {label}
        {required && <span className="ml-0.5 text-indigo-600">*</span>}
      </span>
      {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
    </label>
    <div className="relative">
      <Icon
        className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
          error ? 'text-red-400' : 'text-slate-400'
        }`}
      />
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const inputClass = (error) =>
  `w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition
   placeholder:text-slate-400
   ${error
     ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
     : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`;

/* ------------------------------------------------------------ Component */

const CompanyRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = passwordScore(formData.admin_password);

  useEffect(() => {
    if (!done) return undefined;
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick);
          navigate('/login');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [done, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep = (target) => {
    const next = {};

    if (target >= 1) {
      if (!formData.company_name.trim()) next.company_name = 'Company name is required';
      if (!formData.company_email.trim()) next.company_email = 'Company email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.company_email)) next.company_email = 'Enter a valid email address';
    }

    if (target >= 2) {
      if (!formData.admin_name.trim()) next.admin_name = 'Admin name is required';
      if (!formData.admin_email.trim()) next.admin_email = 'Admin email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) next.admin_email = 'Enter a valid email address';
      if (!formData.admin_password) next.admin_password = 'Password is required';
      else if (formData.admin_password.length < 6) next.admin_password = 'Use at least 6 characters';
      if (formData.admin_password !== formData.confirm_password) next.confirm_password = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep(1)) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) return goNext();
    if (!validateStep(2)) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES_REGISTER}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: formData.company_name,
            company_email: formData.company_email,
            company_address: formData.company_address,
            company_phone: formData.company_phone,
            admin_name: formData.admin_name,
            admin_email: formData.admin_email,
            admin_password: formData.admin_password,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData(EMPTY_FORM);
        setDone(true);
      } else if (data.errors) {
        const backendErrors = {};
        Object.keys(data.errors).forEach((key) => {
          backendErrors[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
        });
        setErrors(backendErrors);
        // Jump back to the step that owns the failing field.
        if (['company_name', 'company_email', 'company_address', 'company_phone']
          .some((k) => backendErrors[k])) setStep(1);
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------- Success screen */

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/60"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <FiCheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
            Company registered
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Your workspace is ready. Sign in with the administrator credentials you just created to
            start enrolling employees.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-7 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to sign in
          </button>
          <p className="mt-3 text-xs text-slate-400">
            Redirecting automatically in {countdown}s
          </p>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------------------------------------- Layout */

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[42%_58%]">
      {/* ---------------------------------------------------- Brand panel */}
      <aside className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(60rem 40rem at 15% 10%, rgba(79,70,229,0.55), transparent 60%), radial-gradient(45rem 35rem at 90% 90%, rgba(14,165,233,0.35), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(70% 60% at 50% 40%, #000, transparent)',
            WebkitMaskImage: 'radial-gradient(70% 60% at 50% 40%, #000, transparent)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <FiAperture className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">FaceAttend</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Attendance that runs itself.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            Register your organisation once and give every employee contactless, face-verified
            check-in — with shift rules, late marking and reporting built in.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              { icon: FiUserCheck, title: 'Face-verified check-in', body: 'Sub-second recognition, no cards or fingerprints.' },
              { icon: FiClock, title: 'Shift & late-mark rules', body: 'Grace periods and timings enforced automatically.' },
              { icon: FiShield, title: 'Isolated company data', body: 'Every organisation gets its own secure tenant.' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-indigo-200" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{title}</span>
                  <span className="mt-0.5 block text-sm text-slate-400">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-slate-400">
          <FiUsers className="h-3.5 w-3.5" />
          Trusted for workforce attendance across shifts and locations.
        </div>
      </aside>

      {/* ----------------------------------------------------- Form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10 lg:py-14">
        <div className="w-full max-w-xl">
          {/* Mobile brand mark */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <FiAperture className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">FaceAttend</span>
          </div>

          <header>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Create your company account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Two quick steps. You&apos;ll be the administrator of this workspace.
            </p>
          </header>

          {/* Stepper */}
          <ol className="mt-8 flex items-center gap-3">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const complete = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <li className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                        complete
                          ? 'bg-emerald-500 text-white'
                          : active
                            ? 'bg-slate-900 text-white ring-4 ring-slate-900/10'
                            : 'bg-white text-slate-400 ring-1 ring-slate-200'
                      }`}
                    >
                      {complete ? <FiCheck className="h-4 w-4" /> : s.id}
                    </span>
                    <span className="hidden sm:block">
                      <span className={`block text-sm font-medium ${active || complete ? 'text-slate-900' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                      <span className="block text-xs text-slate-400">{s.hint}</span>
                    </span>
                  </li>
                  {i < STEPS.length - 1 && (
                    <li aria-hidden className="h-px flex-1 bg-slate-200">
                      <span
                        className={`block h-px bg-slate-900 transition-all duration-500 ${step > s.id ? 'w-full' : 'w-0'}`}
                      />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>

          {/* Card */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-sm font-medium text-red-700">{errors.general}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                  >
                    <Field id="company_name" label="Company name" icon={FiBriefcase} required error={errors.company_name} className="sm:col-span-2">
                      <input
                        id="company_name"
                        name="company_name"
                        type="text"
                        autoComplete="organization"
                        placeholder="Acme Manufacturing Pvt. Ltd."
                        value={formData.company_name}
                        onChange={handleChange}
                        className={inputClass(errors.company_name)}
                      />
                    </Field>

                    <Field id="company_email" label="Company email" icon={FiMail} required error={errors.company_email} className="sm:col-span-2">
                      <input
                        id="company_email"
                        name="company_email"
                        type="email"
                        autoComplete="email"
                        placeholder="contact@acme.com"
                        value={formData.company_email}
                        onChange={handleChange}
                        className={inputClass(errors.company_email)}
                      />
                    </Field>

                    <Field id="company_phone" label="Phone number" icon={FiPhone} hint="Optional" error={errors.company_phone}>
                      <input
                        id="company_phone"
                        name="company_phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={formData.company_phone}
                        onChange={handleChange}
                        className={inputClass(errors.company_phone)}
                      />
                    </Field>

                    <Field id="company_address" label="Address" icon={FiMapPin} hint="Optional" error={errors.company_address}>
                      <input
                        id="company_address"
                        name="company_address"
                        type="text"
                        autoComplete="street-address"
                        placeholder="City, State"
                        value={formData.company_address}
                        onChange={handleChange}
                        className={inputClass(errors.company_address)}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={goNext}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15"
                      >
                        Continue
                        <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                  >
                    <Field id="admin_name" label="Full name" icon={FiUser} required error={errors.admin_name}>
                      <input
                        id="admin_name"
                        name="admin_name"
                        type="text"
                        autoComplete="name"
                        placeholder="Jordan Mehta"
                        value={formData.admin_name}
                        onChange={handleChange}
                        className={inputClass(errors.admin_name)}
                      />
                    </Field>

                    <Field id="admin_email" label="Work email" icon={FiMail} required error={errors.admin_email}>
                      <input
                        id="admin_email"
                        name="admin_email"
                        type="email"
                        autoComplete="username"
                        placeholder="you@acme.com"
                        value={formData.admin_email}
                        onChange={handleChange}
                        className={inputClass(errors.admin_email)}
                      />
                    </Field>

                    <Field
                      id="admin_password"
                      label="Password"
                      icon={FiLock}
                      required
                      hint="Min. 6 characters"
                      error={errors.admin_password}
                      className="sm:col-span-2"
                    >
                      <input
                        id="admin_password"
                        name="admin_password"
                        type={showPwd ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        value={formData.admin_password}
                        onChange={handleChange}
                        className={`${inputClass(errors.admin_password)} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
                      >
                        {showPwd ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </Field>

                    {formData.admin_password && (
                      <div className="-mt-2 sm:col-span-2">
                        <div className="flex items-center gap-2">
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
                      </div>
                    )}

                    <Field
                      id="confirm_password"
                      label="Confirm password"
                      icon={FiLock}
                      required
                      error={errors.confirm_password}
                      className="sm:col-span-2"
                    >
                      <input
                        id="confirm_password"
                        name="confirm_password"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`${inputClass(errors.confirm_password)} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
                      >
                        {showConfirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </button>
                    </Field>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:col-span-2">
                      <p className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-500">
                        <FiShield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        This account becomes the owner of
                        <span className="font-medium text-slate-700">
                          {formData.company_name ? ` ${formData.company_name}` : ' your company'}
                        </span>
                        . You can invite more admins and employees after signing in.
                      </p>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <FiArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Creating account…
                          </>
                        ) : (
                          <>
                            Create company account
                            <FiArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-indigo-600 underline-offset-4 transition hover:text-indigo-700 hover:underline"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CompanyRegister;
