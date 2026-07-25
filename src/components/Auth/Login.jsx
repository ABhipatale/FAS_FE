import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle,
  FiArrowRight, FiShield, FiClock, FiLayers, FiCrosshair, FiCamera,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import InstallAppButton from "../InstallAppButton";
import { homePathFor } from "../../config/roles";

const REMEMBER_KEY = "loginEmail";

const HIGHLIGHTS = [
  {
    icon: FiCamera,
    title: "Face recognition attendance",
    body: "Employees punch in from the kiosk in seconds — no cards, no queues.",
  },
  {
    icon: FiClock,
    title: "Shift-aware tracking",
    body: "Late marks and worked hours are calculated against each assigned shift.",
  },
  {
    icon: FiLayers,
    title: "Built for many companies",
    body: "Every workspace keeps its own people, shifts and records fully separated.",
  },
];

// Last email used on this device, so "Remember me" is a real convenience
// rather than a decorative checkbox.
const rememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
};

export default function Login() {
  const [formData, setFormData] = useState(() => ({ email: rememberedEmail(), password: "" }));
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [remember, setRemember] = useState(() => Boolean(rememberedEmail()));

  const emailRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { success, message: responseMessage, user } = await login(
      formData.email,
      formData.password
    );

    if (success) {
      if (remember) localStorage.setItem(REMEMBER_KEY, formData.email);
      else localStorage.removeItem(REMEMBER_KEY);

      setMessage(responseMessage);
      setRedirecting(true);
      // Each role has its own home: kiosk accounts get the attendance screen,
      // employees their own dashboard, superadmins the cross-company console.
      const target = homePathFor(user?.role);
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 1500);
    } else {
      setError(responseMessage);
    }

    setLoading(false);
  };

  const busy = loading || redirecting;

  return (
    <div className="flex min-h-screen bg-white">
      <style>{CSS}</style>
      <InstallAppButton />

      {/* ─────────────────────────── Brand panel (desktop) */}
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden bg-[#0a1020] lg:flex xl:w-[52%]">
        {/* Depth: soft radial glows over a fine grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 login-grid" />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-indigo-500/20 blur-[110px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-sky-400/12 blur-[120px]" />

        <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <FiCrosshair className="h-5 w-5 text-indigo-300" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">Face Attendance</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-300/70">
                Workforce Platform
              </p>
            </div>
          </div>

          {/* Headline + highlights */}
          <div className="max-w-lg py-14">
            {/* The scan ring is the one piece of motion on the page - slow,
                quiet, and disabled under prefers-reduced-motion. */}
            <div aria-hidden className="relative mb-10 h-16 w-16">
              <span className="login-ring absolute inset-0 rounded-2xl ring-1 ring-indigo-400/40" />
              <span className="login-ring login-ring--delay absolute inset-0 rounded-2xl ring-1 ring-indigo-400/25" />
              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-sky-400/10 ring-1 ring-white/10">
                <FiShield className="h-6 w-6 text-indigo-200" />
              </span>
            </div>

            <h1 className="text-[2.6rem] font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
              Attendance that
              <span className="block bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-100 bg-clip-text text-transparent">
                runs itself.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-400">
              One console for face-verified punches, shift rules, and reporting —
              across every company you operate.
            </p>

            <ul className="mt-11 space-y-6">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
                    <item.icon className="h-4 w-4 text-indigo-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer strip */}
          <div className="flex items-center gap-6 border-t border-white/10 pt-6">
            <p className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <FiLock className="h-3.5 w-3.5 text-emerald-400" />
              Encrypted session
            </p>
            <p className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <FiShield className="h-3.5 w-3.5 text-emerald-400" />
              Role-based access
            </p>
            <p className="ml-auto text-[11px] text-slate-500">
              © {new Date().getFullYear()} TESTQ Technologies
            </p>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────── Form panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[25rem]"
        >
          {/* Compact mark for viewports without the brand panel */}
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <FiCrosshair className="h-5 w-5 text-indigo-300" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900">Face Attendance</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Workforce Platform
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use your administrator credentials to open the dashboard.
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  role="alert"
                  id="login-error"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
                >
                  <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            {message && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5"
                >
                  <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-800">
                    {message} — taking you to your dashboard…
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={busy}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={inputClass(error)}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyUp={(e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false)}
                  required
                  disabled={busy}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`${inputClass(error)} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  disabled={busy}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  {showPwd ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>

              {capsOn && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Caps Lock is on
                </p>
              )}
            </div>

            {/* Remember */}
            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={busy}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/30"
              />
              Remember my email on this device
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {redirecting ? "Signed in — redirecting…" : "Verifying credentials…"}
                </>
              ) : (
                <>
                  Sign in
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Secondary paths */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/employee-login"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <FiCamera className="h-4 w-4 text-indigo-600" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">Employee sign in</span>
                  <span className="block text-xs text-slate-500">View your attendance and hours</span>
                </span>
              </span>
              <FiArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>

            <p className="text-center text-xs leading-relaxed text-slate-400">
              Accounts are created by your administrator.
            </p>
          </div>

          <p className="mt-9 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 lg:hidden">
            <FiLock className="h-3 w-3" />
            Encrypted session · © {new Date().getFullYear()} TESTQ Technologies
          </p>
        </motion.div>
      </main>
    </div>
  );
}

/* --------------------------------------------------------------- styles */

const inputClass = (error) =>
  `w-full rounded-xl border bg-white py-3 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition
   placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500
   ${error
    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
    : "border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"}`;

const CSS = `
  .login-grid {
    background-image:
      linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px);
    background-size: 46px 46px;
    mask-image: radial-gradient(ellipse 80% 70% at 30% 30%, #000 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 30% 30%, #000 40%, transparent 100%);
  }
  @keyframes loginPulse {
    0%   { transform: scale(1);    opacity: 0.9; }
    70%  { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.55); opacity: 0; }
  }
  .login-ring { animation: loginPulse 3.4s cubic-bezier(0.4,0,0.2,1) infinite; }
  .login-ring--delay { animation-delay: 1.7s; }
  @media (prefers-reduced-motion: reduce) {
    .login-ring { animation: none; opacity: 0.35; }
  }
`;
