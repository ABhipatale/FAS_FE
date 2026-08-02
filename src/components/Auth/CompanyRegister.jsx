import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase, FiMail, FiMapPin, FiPhone, FiUser, FiLock,
  FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiAlertCircle,
  FiCheck, FiCheckCircle, FiShield, FiPlus, FiSearch, FiX,
  FiRefreshCw, FiUsers, FiInbox, FiEdit2, FiPower, FiSave,
  FiImage, FiUpload, FiTrash2,
} from 'react-icons/fi';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { fileToLogoDataUrl, LOGO_ACCEPT_ATTR, LOGO_MAX_PIXELS } from '../../utils/companyLogo';
import { BRAND, DEFAULT_LOGO, logoOrDefault } from '../../config/brand';

const STEPS = [
  { id: 1, label: 'Company', hint: 'Organisation details' },
  { id: 2, label: 'Administrator', hint: 'Login account' },
];

const EMPTY_FORM = {
  company_name: '',
  company_email: '',
  company_address: '',
  company_phone: '',
  company_logo: '',
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

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

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

/* ---------------------------------------------------------- LogoPicker */

/**
 * Picks a company logo and hands back a resized base64 data URI. The logo is
 * what the sidebar, the company list and the attendance PDF all render, so
 * `value` is stored on the company record rather than as an uploaded file.
 */
const LogoPicker = ({ id, value, name, error, disabled, onChange }) => {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // let the same file be re-picked after a removal
    if (!file) return;

    setBusy(true);
    setLocalError('');
    try {
      onChange(await fileToLogoDataUrl(file));
    } catch (err) {
      setLocalError(err.message || 'Could not use that image.');
    } finally {
      setBusy(false);
    }
  };

  const shown = localError || error;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>Company logo</span>
        <span className="text-xs font-normal text-slate-400">Optional</span>
      </label>

      <div
        className={`flex items-center gap-4 rounded-xl border p-3.5 transition ${
          shown ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {/* No upload yet? The app mark is what this company will actually show,
            so preview that rather than a placeholder. */}
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img
            src={value || DEFAULT_LOGO}
            alt={value ? `${name || 'Company'} logo` : `${BRAND.name} logo`}
            className={`h-full w-full object-contain p-1 ${value ? '' : 'opacity-70'}`}
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={id}
              className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition ${
                disabled || busy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'
              }`}
            >
              {busy
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                : <FiUpload className="h-3.5 w-3.5" />}
              {value ? 'Replace' : 'Upload logo'}
            </label>

            {value && (
              <button
                type="button"
                onClick={() => { setLocalError(''); onChange(''); }}
                disabled={disabled || busy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-red-600 disabled:opacity-50"
              >
                <FiTrash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>

          <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${shown ? 'font-medium text-red-600' : 'text-slate-400'}`}>
            {shown ? <FiAlertCircle className="h-3.5 w-3.5 shrink-0" /> : <FiImage className="h-3.5 w-3.5 shrink-0" />}
            {shown ||
              (value
                ? `PNG, JPG, WEBP or SVG — resized to ${LOGO_MAX_PIXELS}px automatically.`
                : `No logo yet — the ${BRAND.name} mark is used until one is uploaded.`)}
          </p>
        </div>

        <input
          id={id}
          type="file"
          accept={LOGO_ACCEPT_ATTR}
          disabled={disabled || busy}
          onChange={handleFile}
          className="sr-only"
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------- Registration modal */

const CompanyFormModal = ({ open, onClose, onCreated }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = passwordScore(formData.admin_password);

  // Reset to a clean slate every time the modal is opened
  useEffect(() => {
    if (open) {
      setFormData(EMPTY_FORM);
      setStep(1);
      setErrors({});
      setShowPwd(false);
      setShowConfirm(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

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
            company_logo: formData.company_logo || null,
            admin_name: formData.admin_name,
            admin_email: formData.admin_email,
            admin_password: formData.admin_password,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        onCreated(formData.company_name);
      } else if (data.errors) {
        const backendErrors = {};
        Object.keys(data.errors).forEach((key) => {
          backendErrors[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
        });
        setErrors(backendErrors);
        // Jump back to the step that owns the failing field.
        if (['company_name', 'company_email', 'company_address', 'company_phone', 'company_logo']
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-form-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 sm:p-8 sm:pb-6">
              <div>
                <h2 id="company-form-title" className="text-xl font-semibold tracking-tight text-slate-900">
                  Register a new company
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Two quick steps — the workspace and its first administrator.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* Stepper */}
              <ol className="flex items-center gap-3">
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

              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-sm font-medium text-red-700">{errors.general}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} noValidate className="mt-6">
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
                        <LogoPicker
                          id="company_logo"
                          value={formData.company_logo}
                          name={formData.company_name}
                          error={errors.company_logo}
                          disabled={loading}
                          onChange={(logo) => {
                            setFormData((prev) => ({ ...prev, company_logo: logo }));
                            if (errors.company_logo) setErrors((prev) => ({ ...prev, company_logo: '' }));
                          }}
                        />
                        <p className="mt-2 text-xs text-slate-400">
                          Shown in this company&apos;s sidebar, in the company list and on exported attendance reports.
                        </p>
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className="group flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15"
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
                            {formData.company_name ? ` ${formData.company_name}` : ' the company'}
                          </span>
                          . More admins and employees can be invited afterwards.
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* --------------------------------------------------------- Edit modal */

const CompanyEditModal = ({ company, token, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', logo: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Load the selected company into the form each time one is opened
  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      logo: company.logo || '',
      status: company.status === 'inactive' ? 'inactive' : 'active',
    });
    setErrors({});
  }, [company]);

  useEffect(() => {
    if (!company) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [company, saving, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = 'Company name is required';
    if (!form.email.trim()) next.email = 'Company email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_BY_ID(company.id)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            logo: form.logo || null,
            status: form.status,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        onSaved(data.data, `${form.name} was updated.`);
      } else if (data.errors) {
        const backendErrors = {};
        Object.keys(data.errors).forEach((key) => {
          backendErrors[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
        });
        setErrors(backendErrors);
      } else {
        setErrors({ general: data.message || 'Could not update this company.' });
      }
    } catch (error) {
      console.error('Company update error:', error);
      setErrors({ general: 'Network error. Check your connection and try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {company && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && onClose()}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-edit-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 sm:p-8 sm:pb-6">
              <div>
                <h2 id="company-edit-title" className="text-xl font-semibold tracking-tight text-slate-900">
                  Edit company
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Changes apply immediately for everyone in this workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8">
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

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field id="edit_name" label="Company name" icon={FiBriefcase} required error={errors.name} className="sm:col-span-2">
                  <input
                    id="edit_name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field id="edit_email" label="Company email" icon={FiMail} required error={errors.email} className="sm:col-span-2">
                  <input
                    id="edit_email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass(errors.email)}
                  />
                </Field>

                <Field id="edit_phone" label="Phone number" icon={FiPhone} hint="Optional" error={errors.phone}>
                  <input
                    id="edit_phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass(errors.phone)}
                  />
                </Field>

                <Field id="edit_address" label="Address" icon={FiMapPin} hint="Optional" error={errors.address}>
                  <input
                    id="edit_address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    className={inputClass(errors.address)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <LogoPicker
                    id="edit_logo"
                    value={form.logo}
                    name={form.name}
                    error={errors.logo}
                    disabled={saving}
                    onChange={(logo) => {
                      setForm((prev) => ({ ...prev, logo }));
                      if (errors.logo) setErrors((prev) => ({ ...prev, logo: '' }));
                    }}
                  />
                </div>

                <Field id="edit_status" label="Status" icon={FiPower} error={errors.status} className="sm:col-span-2">
                  <select
                    id="edit_status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${inputClass(errors.status)} appearance-none pr-10`}
                  >
                    <option value="active">Active — members can sign in</option>
                    <option value="inactive">Inactive — workspace suspended</option>
                  </select>
                </Field>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ----------------------------------------------------- Confirm dialog */

const ConfirmDialog = ({ open, title, body, confirmLabel, busy, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !busy && onCancel()}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        />
        <motion.div
          role="alertdialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
            <FiAlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* ------------------------------------------------------- List helpers */

const StatusBadge = ({ status }) => {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-t border-slate-100">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 w-full max-w-[9rem] animate-pulse rounded bg-slate-100" />
      </td>
    ))}
  </tr>
);

/* ------------------------------------------------------- Main screen */

const CompanyManagement = () => {
  // `company` here is the signed-in superadmin's own company - the backend
  // refuses to deactivate it, so the row is marked and its button disabled.
  const { token, company: ownCompany, getCompanyDetails } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [busyId, setBusyId] = useState(null);
  // Kept separate from `error`: a failed row action must not blank out the table
  const [actionError, setActionError] = useState('');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCompanies(Array.isArray(data.data) ? data.data : []);
      } else if (response.status === 403) {
        setError('Only a superadmin can view the list of companies.');
      } else {
        setError(data.message || 'Could not load companies.');
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCompanies();
  }, [token, fetchCompanies]);

  // Auto-dismiss the success toast
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleCreated = (companyName) => {
    setModalOpen(false);
    setToast(`${companyName} was registered successfully.`);
    fetchCompanies();
  };

  // Patch a single row in place so the table doesn't flash on save
  const applyUpdate = (updated, message) => {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    setEditing(null);
    setActionError('');
    if (message) setToast(message);
    // Editing your own company (a new logo, say) must re-brand the sidebar
    // straight away, not on the next sign-in.
    if (ownCompany?.id === updated.id) getCompanyDetails();
  };

  const setStatus = async (company, status) => {
    setBusyId(company.id);
    setActionError('');

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_BY_ID(company.id)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        applyUpdate(
          data.data,
          `${company.name} is now ${status === 'active' ? 'active' : 'inactive'}.`
        );
      } else {
        setActionError(data.message || `Could not ${status === 'active' ? 'activate' : 'deactivate'} ${company.name}.`);
      }
    } catch (err) {
      console.error('Company status update failed:', err);
      setActionError('Network error. Check your connection and try again.');
    } finally {
      setBusyId(null);
      setPendingDeactivate(null);
    }
  };

  // Activating is harmless; deactivating locks users out, so confirm first.
  const handleToggleStatus = (company) => {
    if (company.status === 'active') setPendingDeactivate(company);
    else setStatus(company, 'active');
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((c) =>
      [c.name, c.email, c.phone, c.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [companies, query]);

  const activeCount = useMemo(
    () => companies.filter((c) => c.status === 'active').length,
    [companies]
  );

  return (
    // No max-width: the box fills whatever the layout gives it, so collapsing
    // the sidebar actually widens the table instead of adding empty margin.
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Company Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every organisation registered on this deployment.
            {!loading && !error && companies.length > 0 && (
              <span className="ml-1 text-slate-400">
                {companies.length} total · {activeCount} active
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCompanies}
            disabled={loading}
            title="Refresh"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/20"
          >
            <FiPlus className="h-4 w-4" />
            Add company
          </button>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="flex-1 text-sm font-medium text-emerald-800">{toast}</p>
            <button
              type="button"
              onClick={() => setToast('')}
              aria-label="Dismiss"
              className="text-emerald-600 transition hover:text-emerald-800"
            >
              <FiX className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mt-6">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone or address…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      {/* Failed to load the list - the table can't render at all */}
      {error && !loading && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <FiAlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="flex-1 text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchCompanies}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      )}

      {/* A single action failed - the list itself is still valid, so keep it visible */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="flex-1 text-sm font-medium text-red-700">{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError('')}
              aria-label="Dismiss"
              className="text-red-500 transition hover:text-red-700"
            >
              <FiX className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {!error && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3 font-medium">Company</th>
                  <th scope="col" className="px-5 py-3 font-medium">Contact</th>
                  <th scope="col" className="px-5 py-3 font-medium">Address</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Registered</th>
                  {/* Pinned right so the buttons stay reachable when the table scrolls */}
                  <th scope="col" className="sticky right-0 bg-slate-50 px-5 py-3 text-right font-medium shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.12)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

                {!loading && filtered.map((company) => {
                  const isOwnCompany = ownCompany?.id === company.id;

                  return (
                  <tr key={company.id} className="group border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <img
                            src={logoOrDefault(company.logo)}
                            alt={`${company.name} logo`}
                            className="h-full w-full object-contain p-0.5"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-medium text-slate-900">
                            {company.name}
                            {isOwnCompany && (
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                Your company
                              </span>
                            )}
                          </p>
                          {company.users_count !== undefined && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                              <FiUsers className="h-3 w-3" />
                              {company.users_count} {company.users_count === 1 ? 'user' : 'users'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-slate-700">{company.email || '—'}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{company.phone || 'No phone'}</p>
                    </td>
                    <td className="max-w-[16rem] px-5 py-4">
                      <p className="truncate text-slate-600">{company.address || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="sticky right-0 whitespace-nowrap bg-white px-5 py-4 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.12)] transition-colors group-hover:bg-slate-50">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(company)}
                          disabled={busyId === company.id}
                          title={`Edit ${company.name}`}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(company)}
                          disabled={busyId === company.id || (isOwnCompany && company.status === 'active')}
                          title={isOwnCompany && company.status === 'active'
                            ? 'You cannot deactivate the company your own account belongs to'
                            : company.status === 'active'
                              ? `Deactivate ${company.name}`
                              : `Activate ${company.name}`}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            company.status === 'active'
                              ? 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                              : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {busyId === company.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <FiPower className="h-3.5 w-3.5" />
                          )}
                          {company.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}

                {!loading && filtered.length === 0 && (
                  <tr className="border-t border-slate-100">
                    <td colSpan={6} className="px-5 py-16">
                      <div className="flex flex-col items-center text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <FiInbox className="h-5 w-5 text-slate-400" />
                        </span>
                        <p className="mt-4 text-sm font-medium text-slate-900">
                          {query ? 'No companies match your search' : 'No companies registered yet'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {query
                            ? 'Try a different name, email or phone number.'
                            : 'Register the first organisation to get started.'}
                        </p>
                        {!query && (
                          <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            <FiPlus className="h-4 w-4" />
                            Add company
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CompanyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <CompanyEditModal
        company={editing}
        token={token}
        onClose={() => setEditing(null)}
        onSaved={applyUpdate}
      />

      <ConfirmDialog
        open={Boolean(pendingDeactivate)}
        title={`Deactivate ${pendingDeactivate?.name ?? 'this company'}?`}
        body="Its workspace is suspended until you activate it again. Existing attendance records are kept."
        confirmLabel="Deactivate"
        busy={busyId === pendingDeactivate?.id}
        onConfirm={() => setStatus(pendingDeactivate, 'inactive')}
        onCancel={() => setPendingDeactivate(null)}
      />
    </div>
  );
};

export default CompanyManagement;
