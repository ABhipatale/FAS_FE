import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  FiAlertCircle, FiArrowRight, FiCalendar, FiCamera, FiCheckCircle, FiClock,
  FiLogIn, FiLogOut, FiRefreshCw, FiTrendingUp, FiUser,
} from 'react-icons/fi';
import API_CONFIG, { apiCall } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { hasFaceRegistered } from '../../utils/face';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_STYLE = {
  present: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: '#10b981', label: 'Present' },
  late: { pill: 'bg-amber-50 text-amber-700 border-amber-200', bar: '#f59e0b', label: 'Late' },
  absent: { pill: 'bg-rose-50 text-rose-700 border-rose-200', bar: '#f43f5e', label: 'Absent' },
  leave: { pill: 'bg-sky-50 text-sky-700 border-sky-200', bar: '#0ea5e9', label: 'Leave' },
};

const styleFor = (status) => STATUS_STYLE[status] || {
  pill: 'bg-slate-100 text-slate-600 border-slate-200', bar: '#94a3b8', label: status || '—',
};

const pad = (n) => String(n).padStart(2, '0');
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "09:05:00" -> "9:05 AM"
const prettyTime = (value) => {
  if (!value) return '—';
  const [h, m] = String(value).split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  return `${hour % 12 === 0 ? 12 : hour % 12}:${m ?? '00'} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const prettyDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
};

const hoursLabel = (value) => {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return '—';
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return m ? `${h}h ${pad(m)}m` : `${h}h`;
};

const StatCard = ({ icon, tone, label, value, sub }) => {
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const { user, company } = useAuth();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setError('Your session has no user id — sign out and sign in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Attendance is the page's reason for existing; the profile call only
      // decorates it, so a failure there must not blank the whole screen.
      const [attendance, me] = await Promise.all([
        apiCall(`${API_CONFIG.ENDPOINTS.ATTENDANCE_USER}/${user.id}?month=${month}&year=${year}`),
        apiCall(API_CONFIG.ENDPOINTS.USER_DETAIL(user.id)).catch(() => null),
      ]);

      if (attendance.data.success) {
        setData(attendance.data.data);
      } else {
        setError(attendance.data.message || 'Could not load your attendance.');
      }

      if (me?.data?.success) setProfile(me.data.data);
    } catch (err) {
      console.error('Employee dashboard load failed:', err);
      setError(err.message
        ? `Could not load your attendance: ${err.message}`
        : 'Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, month, year]);

  useEffect(() => { load(); }, [load]);

  const monthly = useMemo(() => data?.monthly ?? [], [data]);
  const weekly = useMemo(() => data?.weekly ?? [], [data]);
  const record = profile || data?.user || null;

  const today = useMemo(
    () => monthly.find((r) => r.date === todayIso()) || weekly.find((r) => r.date === todayIso()) || null,
    [monthly, weekly]
  );

  const totals = useMemo(() => {
    const present = monthly.filter((r) => r.status === 'present').length;
    const late = monthly.filter((r) => r.status === 'late').length;
    const absent = monthly.filter((r) => r.status === 'absent').length;
    const hours = monthly.reduce((sum, r) => sum + (Number(r.hours_worked) || 0), 0);
    const marked = present + late;
    return {
      present,
      late,
      absent,
      hours,
      marked,
      rate: monthly.length ? Math.round((marked / monthly.length) * 100) : 0,
      avgHours: marked ? hours / marked : 0,
    };
  }, [monthly]);

  const chart = useMemo(
    () => weekly.map((r) => ({
      label: prettyDate(r.date).split(' ')[0],
      date: r.date,
      hours: Number(r.hours_worked) || 0,
      status: r.status,
    })),
    [weekly]
  );

  const faceReady = hasFaceRegistered(record);
  const shift = record?.shift;

  /* ------------------------------------------------------------ states */

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-1 py-6">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
        <div className="mt-4 h-72 animate-pulse rounded-2xl bg-slate-100" />
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
            onClick={load}
            className="shrink-0 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const todayStyle = styleFor(today?.status);

  return (
    <div className="mx-auto max-w-6xl px-1 py-6">
      {/* ─── Greeting + live clock ─── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 p-6 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300/80">
              {company?.name || 'My workspace'}
            </p>
            <h1 className="mt-1.5 truncate text-2xl font-bold tracking-tight">
              Hello, {(record?.name || user?.name || 'there').split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {shift
                ? `${shift.shift_name} · ${prettyTime(shift.punch_in_time)} – ${prettyTime(shift.punch_out_time)}`
                : 'No shift assigned yet'}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums leading-none">
                {clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {clock.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })}
              </p>
            </div>
            {/* Read-only by design: punching happens at the attendance kiosk,
                never from an employee's own login. */}
            <span className="flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 ring-1 ring-white/15">
              <FiCamera className="h-3.5 w-3.5 text-indigo-300" />
              Punch at the kiosk
            </span>
          </div>
        </div>
      </div>

      {!faceReady && (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <FiAlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="flex-1 text-sm font-medium text-amber-800">
            Your face isn&apos;t registered yet, so the kiosk can&apos;t recognise you. Ask your administrator to enrol you.
          </p>
        </div>
      )}

      {/* ─── Today ─── */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Today</h2>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${todayStyle.pill}`}>
              {today ? todayStyle.label : 'Not marked yet'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <FiLogIn className="h-3 w-3" /> Punch in
              </p>
              <p className="mt-1.5 text-lg font-bold text-slate-900">{prettyTime(today?.punch_in_time)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <FiLogOut className="h-3 w-3" /> Punch out
              </p>
              <p className="mt-1.5 text-lg font-bold text-slate-900">{prettyTime(today?.punch_out_time)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <FiClock className="h-3 w-3" /> Hours
              </p>
              <p className="mt-1.5 text-lg font-bold text-slate-900">{hoursLabel(today?.hours_worked)}</p>
            </div>
          </div>

          {today?.punch_in_time && !today?.punch_out_time && (
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-600">
              <FiClock className="h-3.5 w-3.5" />
              You&apos;re punched in — remember to punch out at the end of your shift.
            </p>
          )}
        </div>

        {/* Last 7 days */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Last 7 days</h2>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <div className="h-40">
            {chart.length === 0 ? (
              <p className="flex h-full items-center justify-center text-center text-xs text-slate-400">
                No punches in the last week.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(value) => [hoursLabel(value), 'Worked']}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {chart.map((entry) => (
                      <Cell key={entry.date} fill={styleFor(entry.status).bar} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ─── Month stats ─── */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FiCheckCircle}
          tone="bg-emerald-50 text-emerald-600"
          label="Days present"
          value={totals.present}
          sub={`${totals.late} marked late`}
        />
        <StatCard
          icon={FiClock}
          tone="bg-indigo-50 text-indigo-600"
          label="Hours this month"
          value={hoursLabel(totals.hours)}
          sub={`${hoursLabel(totals.avgHours)} average per day`}
        />
        <StatCard
          icon={FiTrendingUp}
          tone="bg-sky-50 text-sky-600"
          label="Attendance rate"
          value={`${totals.rate}%`}
          sub={`${totals.marked} of ${monthly.length} recorded days`}
        />
        <StatCard
          icon={FiAlertCircle}
          tone="bg-rose-50 text-rose-600"
          label="Days absent"
          value={totals.absent}
          sub="Recorded absences this month"
        />
      </div>

      {/* ─── Records ─── */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My attendance</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {monthly.length} record{monthly.length === 1 ? '' : 's'} in {MONTHS[month - 1]} {year}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              aria-label="Month"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
            >
              {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Year"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
            >
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">Punch in</th>
                <th scope="col" className="px-5 py-3 font-semibold">Punch out</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody>
              {[...monthly].reverse().map((row) => (
                <tr key={row.date} className="border-t border-slate-100 transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">
                    {prettyDate(row.date)}
                    {row.date === todayIso() && (
                      <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                        Today
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styleFor(row.status).pill}`}>
                      {styleFor(row.status).label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{prettyTime(row.punch_in_time)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{prettyTime(row.punch_out_time)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-slate-900">
                    {hoursLabel(row.hours_worked)}
                  </td>
                </tr>
              ))}

              {monthly.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <FiCalendar className="h-5 w-5 text-slate-400" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      No attendance recorded for {MONTHS[month - 1]} {year}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Punches appear here as soon as you check in at the kiosk.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <FiUser className="h-3.5 w-3.5" />
            Only your own attendance is visible here.
          </p>
          <Link
            to="/profile"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            My profile
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
