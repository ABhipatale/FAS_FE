import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  FiActivity, FiAlertCircle, FiArrowRight, FiBriefcase, FiCamera,
  FiCheckCircle, FiClock, FiEdit2, FiGrid, FiPower, FiRefreshCw,
  FiSearch, FiTrendingUp, FiUsers,
} from 'react-icons/fi';
import API_CONFIG, { apiCall } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const RANGES = [7, 14, 30];

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const SORTS = [
  { id: 'name', label: 'Name' },
  { id: 'employees', label: 'Employees' },
  { id: 'attendance_rate', label: 'Attendance today' },
  { id: 'face_coverage', label: 'Face coverage' },
  { id: 'created_at', label: 'Newest' },
];

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const formatDateTime = (value) => {
  if (!value) return 'No activity yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No activity yet';
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ------------------------------------------------------------- Widgets */

const KpiCard = (props) => {
  const Icon = props.icon;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{props.label}</p>
          <p className="mt-2 text-3xl font-bold leading-none tracking-tight text-slate-900">{props.value}</p>
          {props.sub && <p className="mt-1.5 text-xs text-slate-500">{props.sub}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${props.tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {props.footer && <div className="mt-4 border-t border-slate-100 pt-3">{props.footer}</div>}
    </div>
  );
};

const Meter = ({ value, tone = 'bg-indigo-500' }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
    <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

const StatusPill = ({ status }) => {
  const active = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const CompanyMark = ({ company, size = 'h-10 w-10' }) =>
  company.logo ? (
    <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white`}>
      <img src={company.logo} alt="" className="h-full w-full object-contain p-1" />
    </span>
  ) : (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700`}>
      {initials(company.name)}
    </span>
  );

const ChartCard = ({ title, hint, children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

/* The Manage / Deactivate pair renders twice - in the md+ table row and in the
   phone card - so it lives here rather than being written out in both.
   `stacked` is the card variant, where the buttons split the card width and get
   a taller tap target. */
const CompanyActions = ({
  company,
  lockedOff,
  busy,
  confirming,
  onManage,
  onToggle,
  onAskConfirm,
  onCancelConfirm,
  stacked = false,
}) => {
  const grow = stacked ? 'flex-1 justify-center py-2' : '';

  return (
    <>
      <button
        type="button"
        onClick={onManage}
        title={`Open company management for ${company.name}`}
        className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 ${grow}`}
      >
        <FiEdit2 className="h-3.5 w-3.5" />
        Manage
      </button>

      {confirming ? (
        <>
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            className={`rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700 disabled:opacity-60 ${grow}`}
          >
            {busy ? 'Working…' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={onCancelConfirm}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            No
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={company.status === 'active' ? onAskConfirm : onToggle}
          disabled={busy || lockedOff}
          title={lockedOff
            ? 'You cannot deactivate the company your own account belongs to'
            : company.status === 'active' ? `Deactivate ${company.name}` : `Activate ${company.name}`}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            company.status === 'active'
              ? 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
              : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
          } ${grow}`}
        >
          {busy
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            : <FiPower className="h-3.5 w-3.5" />}
          {company.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      )}
    </>
  );
};


/* ------------------------------------------------------- Main screen */

const SuperAdminDashboard = () => {
  const { token, company: ownCompany, user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('employees');

  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');

    try {
      const { data: body } = await apiCall(`${API_CONFIG.ENDPOINTS.SUPERADMIN_OVERVIEW}?days=${days}`);
      if (body.success) {
        setData(body.data);
      } else {
        setError(body.message || 'Could not load the system overview.');
      }
    } catch (err) {
      console.error('System overview failed:', err);
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const totals = data?.totals;
  // Memoised so the derived lists below don't recompute on every render
  const companies = useMemo(() => data?.companies ?? [], [data]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const rows = companies.filter((c) => {
      if (statusFilter === 'active' && c.status !== 'active') return false;
      if (statusFilter === 'inactive' && c.status === 'active') return false;
      if (!needle) return true;
      return [c.name, c.email, c.phone].some((f) => (f || '').toLowerCase().includes(needle));
    });

    return [...rows].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created_at') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });
  }, [companies, query, statusFilter, sortBy]);

  // Things a superadmin should act on, cheapest signal first
  const attention = useMemo(() => {
    const list = [];
    companies.forEach((c) => {
      if (c.status !== 'active') list.push({ id: `${c.id}-off`, company: c, text: 'Workspace is inactive' });
      else if (c.employees === 0) list.push({ id: `${c.id}-emp`, company: c, text: 'No employees added yet' });
      else if (c.shifts === 0) list.push({ id: `${c.id}-shift`, company: c, text: 'No shifts configured' });
      else if (c.faces_registered === 0) list.push({ id: `${c.id}-face`, company: c, text: 'No faces registered' });
      else if (c.face_coverage < 60) list.push({ id: `${c.id}-cov`, company: c, text: `Only ${c.face_coverage}% face coverage` });
    });
    return list;
  }, [companies]);

  const statusSplit = useMemo(() => ([
    { name: 'Active', value: totals?.companies_active ?? 0, fill: '#10b981' },
    { name: 'Inactive', value: totals?.companies_inactive ?? 0, fill: '#cbd5e1' },
  ]), [totals]);

  const faceCoverage = totals?.employees > 0
    ? Math.round((totals.faces_registered / totals.employees) * 100)
    : 0;

  const toggleStatus = async (company) => {
    const next = company.status === 'active' ? 'inactive' : 'active';
    setBusyId(company.id);
    setActionError('');

    try {
      const { response, data: body } = await apiCall(API_CONFIG.ENDPOINTS.COMPANY_BY_ID(company.id), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next }),
      });

      if (response.ok && body.success) {
        setData((prev) => prev && {
          ...prev,
          totals: {
            ...prev.totals,
            companies_active: prev.totals.companies_active + (next === 'active' ? 1 : -1),
            companies_inactive: prev.totals.companies_inactive + (next === 'active' ? -1 : 1),
          },
          companies: prev.companies.map((c) => (c.id === company.id ? { ...c, status: next } : c)),
        });
        setToast(`${company.name} is now ${next}.`);
      } else {
        setActionError(body.message || `Could not update ${company.name}.`);
      }
    } catch (err) {
      console.error('Company status update failed:', err);
      setActionError('Network error. Check your connection and try again.');
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  /* ------------------------------------------------------------ states */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-1 py-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="mt-4 h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl px-1 py-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center">
          <FiAlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="flex-1 text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-1 py-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <FiGrid className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">System Overview</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Every company on this deployment · signed in as {user?.name || 'superadmin'}
              {data?.generated_at && (
                <span className="text-slate-400"> · updated {formatDateTime(data.generated_at)}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDays(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  days === r ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate('/company-register')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <FiBriefcase className="h-4 w-4" />
            Manage companies
          </button>
        </div>
      </div>

      {data?.attendance_table_missing && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">
            The attendance table is missing, so attendance figures read zero. Run the database migrations.
          </p>
        </div>
      )}

      {toast && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 text-sm font-medium text-emerald-800">{toast}</p>
          <button type="button" onClick={() => setToast('')} className="text-xs font-semibold text-emerald-700">
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="flex-1 text-sm font-medium text-red-700">{actionError}</p>
          <button type="button" onClick={() => setActionError('')} className="text-xs font-semibold text-red-700">
            Dismiss
          </button>
        </div>
      )}

      {/* ─── KPIs ─── */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={FiBriefcase}
          tone="bg-indigo-50 text-indigo-600"
          label="Companies"
          value={totals.companies}
          sub={`${totals.companies_active} active · ${totals.companies_inactive} inactive`}
          footer={
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <FiTrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              {totals.new_companies_30d} joined in the last 30 days
            </p>
          }
        />

        <KpiCard
          icon={FiUsers}
          tone="bg-sky-50 text-sky-600"
          label="People"
          value={totals.employees}
          sub={`employees · ${totals.admins} admin accounts`}
          footer={
            <p className="text-xs font-medium text-slate-500">
              {totals.users} total user records · {totals.shifts} shifts
            </p>
          }
        />

        <KpiCard
          icon={FiActivity}
          tone="bg-emerald-50 text-emerald-600"
          label="Present today"
          value={totals.present_today}
          sub={`${totals.attendance_rate}% of all employees · ${totals.late_today} late`}
          footer={
            <>
              <Meter value={totals.attendance_rate} tone="bg-emerald-500" />
              <p className="mt-2 text-xs font-medium text-slate-500">
                {totals.companies_reporting} of {totals.companies} companies reporting
              </p>
            </>
          }
        />

        <KpiCard
          icon={FiCamera}
          tone="bg-violet-50 text-violet-600"
          label="Face enrolment"
          value={`${faceCoverage}%`}
          sub={`${totals.faces_registered} of ${totals.employees} employees enrolled`}
          footer={
            <>
              <Meter value={faceCoverage} tone="bg-violet-500" />
              <p className="mt-2 text-xs font-medium text-slate-500">
                {totals.attendance_records.toLocaleString()} attendance records stored
              </p>
            </>
          }
        />
      </div>

      {/* ─── Charts ─── */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Attendance across all companies"
          hint={`last ${days} days`}
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="lateFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                  }}
                />
                <Area
                  type="monotone" dataKey="present" name="Present"
                  stroke="#6366f1" strokeWidth={2} fill="url(#presentFill)"
                />
                <Area
                  type="monotone" dataKey="late" name="Late"
                  stroke="#f59e0b" strokeWidth={2} fill="url(#lateFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-5 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Present
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Late
            </span>
          </div>
        </ChartCard>

        <ChartCard title="Workspace status" hint={`${totals.companies} total`}>
          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusSplit}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {statusSplit.map((slice) => <Cell key={slice.name} fill={slice.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{totals.companies_active}</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">active</span>
            </div>
          </div>

          <div className="mt-2 space-y-2 border-t border-slate-100 pt-3">
            {statusSplit.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ background: slice.fill }} />
                  {slice.name}
                </span>
                <span className="font-semibold text-slate-900">{slice.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ─── Needs attention ─── */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Needs attention</h2>
          <span className="text-xs text-slate-400">
            {attention.length === 0 ? 'all clear' : `${attention.length} item${attention.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {attention.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">
              Every company is active, staffed, has shifts and good face coverage.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {attention.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <CompanyMark company={item.company} size="h-8 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900">{item.company.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                    <FiAlertCircle className="h-3 w-3 shrink-0" />
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── Companies table ─── */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">All companies</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {visible.length} of {companies.length} shown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-56"
              />
            </div>

            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === f.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
              aria-label="Sort companies by"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>Sort: {s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone: one card per company. Seven columns need 62rem, so on a phone
            the table scrolled sideways and the pinned Actions column covered the
            company name. Below md the same fields stack instead. */}
        <div className="divide-y divide-slate-100 md:hidden">
          {visible.map((c) => {
            const isOwn = ownCompany?.id === c.id;
            const lockedOff = isOwn && c.status === 'active';

            return (
              <div key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <CompanyMark company={c} size="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    {/* break-words, not truncate: the card has room to wrap the
                        whole name, and clipping it was the original complaint. */}
                    <p className="break-words text-sm font-semibold text-slate-900">{c.name}</p>
                    {isOwn && (
                      <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                        Yours
                      </span>
                    )}
                    <p className="mt-0.5 break-all text-xs text-slate-400">{c.email || '—'}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <StatusPill status={c.status} />
                  <span className="text-[11px] text-slate-400">Since {formatDate(c.created_at)}</span>
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-900">{c.employees} employees</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {c.users} users · {c.shifts} shift{c.shifts === 1 ? '' : 's'}
                </p>

                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">Face coverage</span>
                      <span className="text-[11px] text-slate-400">
                        {c.faces_registered}/{c.employees} · {c.face_coverage}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Meter
                        value={c.face_coverage}
                        tone={c.face_coverage >= 80 ? 'bg-emerald-500' : c.face_coverage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">Today</span>
                      <span className="text-[11px] text-slate-400">
                        {c.present_today}/{c.employees} · {c.attendance_rate}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Meter value={c.attendance_rate} tone="bg-indigo-500" />
                    </div>
                    {c.late_today > 0 && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                        <FiClock className="h-3 w-3" /> {c.late_today} late
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400">
                  Last punch {formatDateTime(c.last_punch_at)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CompanyActions
                    company={c}
                    lockedOff={lockedOff}
                    busy={busyId === c.id}
                    confirming={confirmId === c.id}
                    onManage={() => navigate('/company-register')}
                    onToggle={() => toggleStatus(c)}
                    onAskConfirm={() => setConfirmId(c.id)}
                    onCancelConfirm={() => setConfirmId(null)}
                    stacked
                  />
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-semibold text-slate-900">No companies match these filters</p>
              <p className="mt-1 text-sm text-slate-500">Clear the search or switch the status filter.</p>
            </div>
          )}
        </div>

        {/* md and up: the full table, where the seven columns actually fit */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[62rem] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold">Company</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">People</th>
                <th scope="col" className="px-5 py-3 font-semibold">Face coverage</th>
                <th scope="col" className="px-5 py-3 font-semibold">Today</th>
                <th scope="col" className="px-5 py-3 font-semibold">Last punch</th>
                <th scope="col" className="sticky right-0 bg-slate-50 px-5 py-3 text-right font-semibold shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.12)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const isOwn = ownCompany?.id === c.id;
                const lockedOff = isOwn && c.status === 'active';

                return (
                  <tr key={c.id} className="group border-t border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CompanyMark company={c} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-semibold text-slate-900">
                            {c.name}
                            {isOwn && (
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                                Yours
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">{c.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusPill status={c.status} />
                      <p className="mt-1.5 text-[11px] text-slate-400">Since {formatDate(c.created_at)}</p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-semibold text-slate-900">{c.employees} employees</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {c.users} users · {c.shifts} shift{c.shifts === 1 ? '' : 's'}
                      </p>
                    </td>

                    <td className="w-40 px-5 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">{c.face_coverage}%</span>
                        <span className="text-[11px] text-slate-400">{c.faces_registered}/{c.employees}</span>
                      </div>
                      <div className="mt-1.5">
                        <Meter
                          value={c.face_coverage}
                          tone={c.face_coverage >= 80 ? 'bg-emerald-500' : c.face_coverage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}
                        />
                      </div>
                    </td>

                    <td className="w-40 px-5 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {c.present_today}/{c.employees}
                        </span>
                        <span className="text-[11px] text-slate-400">{c.attendance_rate}%</span>
                      </div>
                      <div className="mt-1.5">
                        <Meter value={c.attendance_rate} tone="bg-indigo-500" />
                      </div>
                      {c.late_today > 0 && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                          <FiClock className="h-3 w-3" /> {c.late_today} late
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      {formatDateTime(c.last_punch_at)}
                    </td>

                    <td className="sticky right-0 whitespace-nowrap bg-white px-5 py-4 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.12)] transition-colors group-hover:bg-slate-50">
                      <div className="flex items-center justify-end gap-2">
                        <CompanyActions
                          company={c}
                          lockedOff={lockedOff}
                          busy={busyId === c.id}
                          confirming={confirmId === c.id}
                          onManage={() => navigate('/company-register')}
                          onToggle={() => toggleStatus(c)}
                          onAskConfirm={() => setConfirmId(c.id)}
                          onCancelConfirm={() => setConfirmId(null)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visible.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="text-sm font-semibold text-slate-900">No companies match these filters</p>
                    <p className="mt-1 text-sm text-slate-500">Clear the search or switch the status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="text-xs text-slate-400">
            Attendance and enrolment figures are live across every workspace.
          </p>
          <button
            type="button"
            onClick={() => navigate('/company-register')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Company management
            <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
