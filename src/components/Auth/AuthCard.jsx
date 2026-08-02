import { BRAND, DEFAULT_LOGO } from '../../config/brand';

/**
 * The centred card the forgot / reset password screens sit on. Keeps the same
 * wordmark and type scale as the login page without dragging the whole
 * split-screen brand panel along for a two-field form.
 */
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
    <div className="w-full max-w-[26rem]">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img src={DEFAULT_LOGO} alt={`${BRAND.name} logo`} className="h-full w-full object-contain p-1" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-slate-900">{BRAND.name}</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            {BRAND.product} · {BRAND.productTagline}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        {children}
      </div>

      {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}

      <p className="mt-6 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()}{' '}
        <a
          href={BRAND.website}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-slate-500 transition hover:text-slate-700"
        >
          {BRAND.name}
        </a>
      </p>
    </div>
  </div>
);

export default AuthCard;
