import { useCallback, useEffect, useState } from 'react';
import {
  FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMail, FiMonitor,
  FiPlus, FiRefreshCw, FiTrash2, FiX,
} from 'react-icons/fi';
import API_CONFIG, { apiCall } from '../../config/api';
import { KIOSK_ONLY_ROLE, KIOSK_PATH } from '../../config/roles';

const EMPTY = { name: '', email: '', password: '' };

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

/**
 * Registers and lists Attendance App accounts: kiosk device logins that can
 * only open the face attendance screen. Employees deliberately cannot punch
 * from their own login, so every punch happens through one of these.
 */
const AttendanceAppAccounts = ({ canManage }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState('');

  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError('');

    try {
      const { data } = await apiCall(API_CONFIG.ENDPOINTS.USERS);
      if (data.success) {
        setAccounts((data.data || []).filter((u) => u.role === KIOSK_ONLY_ROLE));
      } else {
        setListError(data.message || 'Could not load attendance app accounts.');
      }
    } catch (err) {
      console.error('Kiosk account list failed:', err);
      setListError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const create = async (e) => {
    e.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = 'Give the device a name';
    if (!form.email.trim()) next.email = 'A sign-in email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'A password is required';
    else if (form.password.length < 6) next.password = 'Use at least 6 characters';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setToast('');

    try {
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.USERS, {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: KIOSK_ONLY_ROLE,
        }),
      });

      if (response.ok && data.success) {
        setForm(EMPTY);
        setOpen(false);
        setToast(`${data.data.name} can now sign in on the kiosk.`);
        load();
      } else if (data.errors) {
        const backend = {};
        Object.keys(data.errors).forEach((k) => {
          backend[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k];
        });
        setErrors(backend);
      } else {
        setErrors({ general: data.message || 'Could not create the account.' });
      }
    } catch (err) {
      console.error('Kiosk account create failed:', err);
      setErrors({ general: err.message || 'Could not reach the server.' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (account) => {
    setBusyId(account.id);
    setToast('');

    try {
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.USER_DETAIL(account.id), {
        method: 'DELETE',
      });

      if (response.ok && data.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== account.id));
        setToast(data.message || `${account.name} was removed.`);
      } else {
        setListError(data.message || 'Could not remove that account.');
      }
    } catch (err) {
      console.error('Kiosk account delete failed:', err);
      setListError(err.message || 'Could not reach the server.');
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pb-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-slate-900">Attendance App accounts</h2>
          {/* Capped so the header text never crowds the action buttons */}
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Kiosk logins for the device at your entrance. They can open{' '}
            <span className="font-medium text-slate-700">{KIOSK_PATH}</span> and nothing else — no
            dashboard, no employee data.
          </p>
        </div>

        {canManage && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              Reload
            </button>
            <button
              type="button"
              onClick={() => { setOpen((v) => !v); setErrors({}); }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              {open ? <FiX className="h-3.5 w-3.5" /> : <FiPlus className="h-3.5 w-3.5" />}
              {open ? 'Cancel' : 'Register device'}
            </button>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {!canManage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600">Only administrators can register kiosk accounts.</p>
          </div>
        )}

        {toast && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="flex-1 text-sm font-medium text-emerald-800">{toast}</p>
            <button type="button" onClick={() => setToast('')} className="text-xs font-semibold text-emerald-700">
              Dismiss
            </button>
          </div>
        )}

        {listError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="flex-1 text-sm font-medium text-red-700">{listError}</p>
            <button type="button" onClick={() => setListError('')} className="text-xs font-semibold text-red-700">
              Dismiss
            </button>
          </div>
        )}

        {/* Registration form */}
        {canManage && open && (
          <form onSubmit={create} className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            {errors.general && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-700">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="kiosk_name" label="Device name" icon={FiMonitor} error={errors.name}>
                <input
                  id="kiosk_name" name="name" value={form.name} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.name)}
                  placeholder="Reception kiosk"
                />
              </Field>

              <Field id="kiosk_email" label="Sign-in email" icon={FiMail} error={errors.email}>
                <input
                  id="kiosk_email" name="email" type="email" autoComplete="off"
                  value={form.email} onChange={handleChange}
                  disabled={saving} className={inputClass(errors.email)}
                  placeholder="reception.kiosk@company.com"
                />
              </Field>

              <Field
                id="kiosk_password"
                label="Password"
                icon={FiLock}
                hint="Min. 6 characters"
                error={errors.password}
              >
                <input
                  id="kiosk_password" name="password" type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password" value={form.password} onChange={handleChange}
                  disabled={saving} className={`${inputClass(errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                >
                  {showPwd ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </Field>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <FiPlus className="h-4 w-4" />}
                  {saving ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <FiLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              Sign in on the device with these credentials — it will open the attendance screen and stay there.
              Keep the password to hand; it can only be reset, not read back.
            </p>
          </form>
        )}

        {/* Existing accounts */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <FiMonitor className="h-5 w-5 text-slate-400" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-900">No attendance app accounts yet</p>
            <p className="mt-1 text-sm text-slate-500">
              {canManage
                ? 'Register one to let a kiosk device record punches.'
                : 'Ask an administrator to register a kiosk device.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
                    <FiMonitor className="h-4 w-4 text-indigo-300" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{account.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {account.email} · added {formatDate(account.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                    Kiosk only
                  </span>

                  {canManage && (confirmId === account.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => remove(account)}
                        disabled={busyId === account.id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        {busyId === account.id ? 'Removing…' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(account.id)}
                      title={`Remove ${account.name}`}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AttendanceAppAccounts;
