import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle, FiArrowRight, FiBriefcase, FiCheckCircle, FiClock,
  FiMail, FiMapPin, FiPhone, FiSave, FiShield, FiSidebar,
  FiTrash2, FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LogoPicker from '../common/LogoPicker';
import AttendanceAppAccounts from './AttendanceAppAccounts';

const SIDEBAR_KEY = 'sidebarCollapsed';
const REMEMBER_KEY = 'loginEmail';

const inputClass = (error) =>
  `w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition
   placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500
   ${error
    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
    : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`;

const Field = ({ id, label, icon, error, hint, children, className = '' }) => {
  const Icon = icon;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
      </label>
      <div className="relative">
        <Icon className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? 'text-red-400' : 'text-slate-400'}`} />
        {children}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

const Card = ({ title, description, children, footer }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 p-5 sm:p-6 sm:pb-5">
      <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    <div className="p-5 sm:p-6">{children}</div>
    {footer && (
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">{footer}</div>
    )}
  </section>
);

const Toggle = ({ id, checked, onChange, label, hint, icon }) => {
  const Icon = icon;
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-500" />
        </span>
        <div className="min-w-0">
          <label htmlFor={id} className="block cursor-pointer text-sm font-semibold text-slate-900">{label}</label>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.375rem]' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
};

const Settings = () => {
  const { user, company, updateCompany } = useAuth();
  const canEditCompany = ['admin', 'superadmin'].includes(user?.role);

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', logo: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Device preferences live in localStorage - they are per-browser, not per-account
  const [collapsedDefault, setCollapsedDefault] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === 'true'
  );
  const [rememberedEmail, setRememberedEmail] = useState(
    () => localStorage.getItem(REMEMBER_KEY) || ''
  );

  // Seed the form when the company record arrives (or a different company is
  // loaded). Done during render - React's recommended way to derive state from
  // changing props - so edits in progress are never wiped by a re-render.
  const [syncedId, setSyncedId] = useState(null);
  if (company && company.id !== syncedId) {
    setSyncedId(company.id);
    setForm({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      logo: company.logo || '',
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const saveCompany = async (e) => {
    e.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = 'Company name is required';
    if (!form.email.trim()) next.email = 'Company email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setToast('');

    // updateCompany() already writes the result back into the auth context, so
    // the sidebar re-brands the moment this resolves.
    const result = await updateCompany({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      address: form.address || null,
      logo: form.logo || null,
    });

    if (result.success) {
      setToast('Company settings saved.');
    } else {
      setErrors({ general: result.message || 'Could not save company settings.' });
    }

    setSaving(false);
  };

  const applyCollapsed = (value) => {
    localStorage.setItem(SIDEBAR_KEY, String(value));
    setCollapsedDefault(value);
    setToast('Sidebar preference saved for this device — it applies on the next page load.');
  };

  const forgetEmail = () => {
    localStorage.removeItem(REMEMBER_KEY);
    setRememberedEmail('');
    setToast('Saved sign-in email cleared from this device.');
  };

  return (
    <div className="mx-auto max-w-5xl px-1 py-6">
      {/* ─── Header ─── */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <FiBriefcase className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Company identity, device preferences and attendance app accounts.
          </p>
        </div>
      </div>

      {toast && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 text-sm font-medium text-emerald-800">{toast}</p>
          <button type="button" onClick={() => setToast('')} className="text-xs font-semibold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* ─── Company profile ─── */}
        <form onSubmit={saveCompany} className="lg:col-span-2">
          <Card
            title="Company profile"
            description="The name and logo used across the sidebar, the company list and exported PDF reports."
            footer={canEditCompany ? (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <FiSave className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save company'}
              </button>
            ) : null}
          >
            {!canEditCompany && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Only administrators can change company details. These values are read-only for your account.
                </p>
              </div>
            )}

            {errors.general && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-700">{errors.general}</p>
              </div>
            )}

            {!company ? (
              <p className="text-sm text-slate-500">
                No company is attached to your account, so there is nothing to configure here.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field id="company_name" label="Company name" icon={FiBriefcase} error={errors.name} className="sm:col-span-2">
                  <input id="company_name" name="name" value={form.name} onChange={handleChange}
                    disabled={saving || !canEditCompany} className={inputClass(errors.name)} />
                </Field>

                <Field id="company_email" label="Company email" icon={FiMail} error={errors.email} className="sm:col-span-2">
                  <input id="company_email" name="email" type="email" value={form.email} onChange={handleChange}
                    disabled={saving || !canEditCompany} className={inputClass(errors.email)} />
                </Field>

                <Field id="company_phone" label="Phone" icon={FiPhone} hint="Optional" error={errors.phone}>
                  <input id="company_phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                    disabled={saving || !canEditCompany} className={inputClass(errors.phone)} />
                </Field>

                <Field id="company_address" label="Address" icon={FiMapPin} hint="Optional" error={errors.address}>
                  <input id="company_address" name="address" value={form.address} onChange={handleChange}
                    disabled={saving || !canEditCompany} className={inputClass(errors.address)} />
                </Field>

                <div className="sm:col-span-2">
                  <LogoPicker
                    id="settings_logo"
                    value={form.logo}
                    name={form.name}
                    error={errors.logo}
                    disabled={saving || !canEditCompany}
                    onChange={(logo) => setForm((prev) => ({ ...prev, logo }))}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* ─── Device preferences ─── */}
          <div className="mt-4">
            <Card
              title="This device"
              description="Preferences stored in this browser only — they don't follow your account."
            >
              <div className="space-y-3">
                <Toggle
                  id="pref-collapsed"
                  icon={FiSidebar}
                  checked={collapsedDefault}
                  onChange={applyCollapsed}
                  label="Start with the sidebar collapsed"
                  hint="Opens the dashboard with the icon-only rail on desktop."
                />

                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <FiMail className="h-4 w-4 text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">Saved sign-in email</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {rememberedEmail || 'Nothing saved on this device.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={forgetEmail}
                    disabled={!rememberedEmail}
                    className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </form>

        {/* ─── Side column ─── */}
        <div className="space-y-4">
          <Card title="Manage" description="Jump to the screens that own the rest of the configuration.">
            <div className="space-y-2">
              {[
                { to: '/employees', icon: FiUsers, title: 'Employees', hint: 'People, roles and face enrolment' },
                { to: '/shifts', icon: FiClock, title: 'Shifts', hint: 'Punch windows and late rules' },
                ...(user?.role === 'superadmin'
                  ? [{ to: '/company-register', icon: FiBriefcase, title: 'Companies', hint: 'All workspaces on this deployment' }]
                  : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                      <item.icon className="h-4 w-4 text-indigo-600" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                    </span>
                  </span>
                  <FiArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Kiosk device logins - full width, outside the two-column grid. As a
          second col-span-2 grid item it pushed the side column into row 2 and
          left a hole beside the company form. */}
      <div className="mt-4">
        <AttendanceAppAccounts canManage={canEditCompany} />
      </div>
    </div>
  );
};

export default Settings;
