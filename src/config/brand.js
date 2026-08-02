// Vendor branding for this install.
//
// A customer's own logo (uploaded in Settings / Company Management) always wins
// where one exists. This module supplies the app mark used everywhere else:
// the login and auth screens, the sidebar and company lists before a logo has
// been uploaded, and the header of exported PDF reports.

import growLogo from '../assets/grow.png';
import growLogoDataUrl from '../assets/growLogoData';

export const BRAND = {
  name: 'Growmore IT Services',
  shortName: 'Growmore',
  tagline: 'IT Services',
  product: 'Face Attendance',
  productTagline: 'Workforce Platform',
  website: 'https://www.growmoreitservices.com/',
  websiteLabel: 'growmoreitservices.com',
  // Optional contact details - each one only renders on the login page once it
  // is filled in here, so nothing has to be edited in the components.
  email: '',
  phone: '',
  address: '',
};

/** The app mark as a bundled image URL - use this in <img src=…>. */
export const DEFAULT_LOGO = growLogo;

/**
 * The same mark as a 256px PNG data URI. jsPDF cannot fetch a URL, so the PDF
 * export needs the inline copy.
 */
export const DEFAULT_LOGO_DATA_URL = growLogoDataUrl;

/** A company's own logo when it has one, otherwise the app mark. */
export const logoOrDefault = (logo) => logo || DEFAULT_LOGO;

export default BRAND;
