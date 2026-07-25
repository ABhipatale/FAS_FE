import { useState } from 'react';
import { FiAlertCircle, FiImage, FiTrash2, FiUpload } from 'react-icons/fi';
import { fileToLogoDataUrl, LOGO_ACCEPT_ATTR, LOGO_MAX_PIXELS } from '../../utils/companyLogo';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?';

/**
 * Picks a company logo and hands back a resized base64 data URI. The logo is
 * what the sidebar, the company list and the attendance PDF all render, so
 * `value` is stored on the company record rather than as an uploaded file.
 */
const LogoPicker = ({ id, value, name, error, disabled, label = 'Company logo', onChange }) => {
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
        <span>{label}</span>
        <span className="text-xs font-normal text-slate-400">Optional</span>
      </label>

      <div
        className={`flex items-center gap-4 rounded-xl border p-3.5 transition ${
          shown ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-xs font-semibold text-slate-400">{initials(name)}</span>
          )}
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
            {shown || `PNG, JPG, WEBP or SVG — resized to ${LOGO_MAX_PIXELS}px automatically.`}
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

export default LogoPicker;
