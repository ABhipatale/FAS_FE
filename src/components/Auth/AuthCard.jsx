import { FiCrosshair } from 'react-icons/fi';

/**
 * The centred card the forgot / reset password screens sit on. Keeps the same
 * wordmark and type scale as the login page without dragging the whole
 * split-screen brand panel along for a two-field form.
 */
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
    <div className="w-full max-w-[26rem]">
      <div className="mb-8 flex items-center gap-3">
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        {children}
      </div>

      {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
    </div>
  </div>
);

export default AuthCard;
