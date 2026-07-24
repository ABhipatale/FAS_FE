// Company logo handling.
//
// A logo is stored as a base64 data URI on the company record, so it travels
// with the normal JSON API and can be dropped straight into an <img> or into
// the attendance PDF. To keep that payload small, the picked file is resized
// client-side before it is ever sent.

export const LOGO_MAX_PIXELS = 256;   // longest edge after resizing
export const LOGO_MAX_FILE_MB = 4;    // reject huge source files up front

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

export const LOGO_ACCEPT_ATTR = ACCEPTED.join(',');

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file is not a readable image.'));
    img.src = src;
  });

/**
 * Turn a picked File into a small PNG data URI.
 * Throws an Error with a user-facing message when the file is unusable.
 */
export const fileToLogoDataUrl = async (file) => {
  if (!file) throw new Error('No file selected.');

  if (!ACCEPTED.includes(file.type)) {
    throw new Error('Use a PNG, JPG, WEBP or SVG image.');
  }
  if (file.size > LOGO_MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${LOGO_MAX_FILE_MB} MB.`);
  }

  const original = await readAsDataUrl(file);

  // SVG is already tiny and scales on its own - keep it as-is. Rasterising it
  // through a canvas would also taint some browsers' canvas.
  if (file.type === 'image/svg+xml') return original;

  const img = await loadImage(original);
  const scale = Math.min(1, LOGO_MAX_PIXELS / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/png');
};

// jsPDF cannot rasterise SVG, so only bitmap data URIs go into the report.
export const isPdfSafeLogo = (logo) =>
  typeof logo === 'string' && /^data:image\/(png|jpe?g)/i.test(logo);
