// Account types and where each one is allowed to go.
//
// `attendanceapp` is a kiosk-only account: the app exposes the single face
// attendance screen to it and nothing else - no dashboard, no sidebar, no other
// route. `employee` is a normal person who also gets their own dashboard.

export const KIOSK_ONLY_ROLE = 'attendanceapp';
export const KIOSK_PATH = '/face-attendance';

export const ROLE_LABELS = {
  superadmin: 'Super Administrator',
  admin: 'Administrator',
  employee: 'Employee',
  user: 'Employee',
  [KIOSK_ONLY_ROLE]: 'Attendance App (kiosk only)',
};

// Types an admin may assign when creating or editing a person
export const ASSIGNABLE_TYPES = [
  {
    value: 'employee',
    label: 'Employee',
    hint: 'Own attendance dashboard, face attendance and profile.',
  },
  {
    value: KIOSK_ONLY_ROLE,
    label: 'Attendance App',
    hint: 'Kiosk device account — only the face attendance screen, nothing else.',
  },
];

export const isKioskOnly = (role) => role === KIOSK_ONLY_ROLE;

export const isEmployeeRole = (role) => role === 'employee' || role === 'user';

// Where a role lands on sign-in, on "/", or when it opens a page it may not see
export const homePathFor = (role) => {
  if (isKioskOnly(role)) return KIOSK_PATH;
  if (isEmployeeRole(role)) return '/my-dashboard';
  if (role === 'superadmin') return '/superadmin';
  return '/dashboard';
};
