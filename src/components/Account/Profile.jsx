import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle, FiBriefcase, FiCalendar, FiCamera, FiCheckCircle, FiClock,
  FiEye, FiEyeOff, FiKey, FiMail, FiMapPin, FiPhone, FiRefreshCw, FiSave,
  FiShield, FiUser, FiUsers,
} from 'react-icons/fi';
import API_CONFIG, { apiCall } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { hasFaceRegistered } from '../../utils/face';

const ROLE_LABEL = {
  superadmin: 'Super Administrator',
  admin: 'Administrator',
  employee: 'Employee',
  user: 'Employee',
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// "09:00:00" -> "9:00 AM"
const formatTime = (value) => {
  if (!value) return '—';
  const [h, m] = String(value).split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  return `${hour % 12 === 0 ? 12 : hour % 12}:${m ?? '00'} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const inputClass = (error) =>
  `w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition
   placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500
   ${error
    ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
    : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`;

const Field = ({ id, label, icon, error, hint, children }) => {
  const Icon = icon;
  return (
    <div>
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
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
        {footer}
      </div>
    )}
  </section>
);

const Profile = () => {
  const { user, company, applyUserUpdate } = useAuth();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', position: '', sex: '', age: '', dob: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [pwd, setPwd] = useState({ next: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setLoadError('Your session has no user id — sign out and sign in again.');
      return;
    }

    setLoading(true);
    setLoadError('');

    try {
      const { data } = await apiCall(API_CONFIG.ENDPOINTS.USER_DETAIL(user.id));
      if (data.success) {
        const u = data.data;
        setRecord(u);
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          position: u.position || '',
          sex: u.sex || '',
          age: u.age ?? '',
          dob: u.dob ? String(u.dob).slice(0, 10) : '',
        });
      } else {
        setLoadError(data.message || 'Could not load your profile.');
      }
    } catch (err) {
      console.error('Profile load failed:', err);
      // Surface the real reason - a generic "network error" hides dead endpoints.
      setLoadError(err.message
        ? `Could not load your profile: ${err.message}`
        : 'Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const faceReady = useMemo(() => hasFaceRegistered(record), [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // The backend PUT validates name + email as required and treats every other
  // field as a partial update, so both always go along for the ride.
  const saveDetails = async (e) => {
    e.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = 'Your name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.age && (Number(form.age) < 18 || Number(form.age) > 100)) next.age = 'Age must be between 18 and 100';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setToast('');

    try {
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.USER_DETAIL(user.id), {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          address: form.address || null,
          position: form.position || null,
          sex: form.sex || null,
          age: form.age === '' ? null : Number(form.age),
          dob: form.dob || null,
          // role and shift are deliberately not sent - a profile edit must
          // never be able to change your own permissions or roster.
        }),
      });

      if (response.ok && data.success) {
        setRecord(data.data);
        applyUserUpdate({ name: data.data.name, email: data.data.email });
        setToast('Your profile has been updated.');
      } else if (data.errors) {
        const backend = {};
        Object.keys(data.errors).forEach((k) => {
          backend[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k];
        });
        setErrors(backend);
      } else {
        setErrors({ general: data.message || 'Could not save your profile.' });
      }
    } catch (err) {
      console.error('Profile save failed:', err);
      setErrors({ general: err.message || 'Could not reach the server. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    const next = {};
    if (!pwd.next) next.next = 'Enter a new password';
    else if (pwd.next.length < 6) next.next = 'Use at least 6 characters';
    if (pwd.next !== pwd.confirm) next.confirm = 'Passwords do not match';
    setPwdErrors(next);
    if (Object.keys(next).length) return;

    setPwdSaving(true);
    setToast('');

    try {
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.USER_DETAIL(user.id), {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: pwd.next,
        }),
      });

      if (response.ok && data.success) {
        setPwd({ next: '', confirm: '' });
        setToast('Password changed. Use it the next time you sign in.');
      } else if (data.errors?.password) {
        setPwdErrors({ next: Array.isArray(data.errors.password) ? data.errors.password[0] : data.errors.password });
      } else {
        setPwdErrors({ general: data.message || 'Could not change your password.' });
      }
    } catch (err) {
      console.error('Password change failed:', err);
      setPwdErrors({ general: err.message || 'Could not reach the server. Try again.' });
    } finally {
      setPwdSaving(false);
    }
  };

  /* ----------------------------------------------------------- states */

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-1 py-6">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 h-36 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100 lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-1 py-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center">
          <FiAlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="flex-1 text-sm font-medium text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="shrink-0 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-1 py-6">
      {/* ─── Identity header ─── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800" />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-6">
          <div className="flex items-end gap-4">
            <span className="-mt-9 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white shadow-md">
              {initials(record?.name)}
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{record?.name}</h1>
              <p className="mt-0.5 truncate text-sm text-slate-500">{record?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              <FiShield className="h-3.5 w-3.5" />
              {ROLE_LABEL[record?.role] || record?.role || 'User'}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                faceReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <FiCamera className="h-3.5 w-3.5" />
              {faceReady ? 'Face registered' : 'No face registered'}
            </span>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              Reload
            </button>
          </div>
        </div>

        {/* Read-only facts that only an admin can change */}
        <dl className="grid grid-cols-1 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3">
          <div className="bg-white px-5 py-4 sm:px-6">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <FiBriefcase className="h-3 w-3" /> Company
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-slate-900">{company?.name || '—'}</dd>
          </div>
          <div className="bg-white px-5 py-4 sm:px-6">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <FiClock className="h-3 w-3" /> Assigned shift
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-slate-900">
              {record?.shift
                ? `${record.shift.shift_name} · ${formatTime(record.shift.punch_in_time)} – ${formatTime(record.shift.punch_out_time)}`
                : 'Not assigned'}
            </dd>
          </div>
          <div className="bg-white px-5 py-4 sm:px-6">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <FiUsers className="h-3 w-3" /> Member since
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(record?.created_at)}</dd>
          </div>
        </dl>
      </div>

      {toast && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 text-sm font-medium text-emerald-800">{toast}</p>
          <button type="button" onClick={() => setToast('')} className="text-xs font-semibold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* ─── Personal details ─── */}
        <form onSubmit={saveDetails} className="lg:col-span-2">
          <Card
            title="Personal details"
            description="Shown to your administrators and used on attendance reports."
            footer={
              <>
                <button
                  type="button"
                  onClick={load}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <FiSave className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </>
            }
          >
            {errors.general && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-700">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="name" label="Full name" icon={FiUser} error={errors.name}>
                <input id="name" name="name" value={form.name} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.name)} />
              </Field>

              <Field id="email" label="Email address" icon={FiMail} error={errors.email}>
                <input id="email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} disabled={saving}
                  className={inputClass(errors.email)} />
              </Field>

              <Field id="phone" label="Phone" icon={FiPhone} hint="Optional" error={errors.phone}>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.phone)} placeholder="+91 98765 43210" />
              </Field>

              <Field id="position" label="Position" icon={FiBriefcase} hint="Optional" error={errors.position}>
                <input id="position" name="position" value={form.position} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.position)} placeholder="Operations Lead" />
              </Field>

              <Field id="sex" label="Sex" icon={FiUser} hint="Optional" error={errors.sex}>
                <select id="sex" name="sex" value={form.sex} onChange={handleChange} disabled={saving}
                  className={`${inputClass(errors.sex)} appearance-none`}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field id="age" label="Age" icon={FiUser} hint="Optional" error={errors.age}>
                <input id="age" name="age" type="number" min="18" max="100" value={form.age}
                  onChange={handleChange} disabled={saving} className={inputClass(errors.age)} />
              </Field>

              <Field id="dob" label="Date of birth" icon={FiCalendar} hint="Optional" error={errors.dob}>
                <input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.dob)} />
              </Field>

              <Field id="address" label="Address" icon={FiMapPin} hint="Optional" error={errors.address}>
                <input id="address" name="address" value={form.address} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.address)} placeholder="City, State" />
              </Field>
            </div>

            <p className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
              <FiShield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              Your role and assigned shift can only be changed by an administrator from Employee Management.
            </p>
          </Card>
        </form>

        {/* ─── Password ─── */}
        <form onSubmit={savePassword}>
          <Card
            title="Password"
            description="Choose something you don't use anywhere else."
            footer={
              <button
                type="submit"
                disabled={pwdSaving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pwdSaving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <FiKey className="h-4 w-4" />}
                {pwdSaving ? 'Updating…' : 'Change password'}
              </button>
            }
          >
            {pwdErrors.general && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-700">{pwdErrors.general}</p>
              </div>
            )}

            <div className="space-y-5">
              <Field id="new_password" label="New password" icon={FiKey} hint="Min. 6 characters" error={pwdErrors.next}>
                <input
                  id="new_password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pwd.next}
                  onChange={(e) => { setPwd((p) => ({ ...p, next: e.target.value })); setPwdErrors({}); }}
                  disabled={pwdSaving}
                  className={`${inputClass(pwdErrors.next)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPwd ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </Field>

              <Field id="confirm_password" label="Confirm password" icon={FiKey} error={pwdErrors.confirm}>
                <input
                  id="confirm_password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pwd.confirm}
                  onChange={(e) => { setPwd((p) => ({ ...p, confirm: e.target.value })); setPwdErrors({}); }}
                  disabled={pwdSaving}
                  className={inputClass(pwdErrors.confirm)}
                />
              </Field>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
                  <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Your current session stays active — the new password applies the next time you sign in.
                </p>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Profile;
