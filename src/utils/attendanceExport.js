// Attendance report building + CSV/PDF export.
//
// Everything here works off the raw /attendance/raw payload (one row per
// employee per day) plus the /users roster, so employees with no punch at all
// in the period still show up in the report instead of silently disappearing.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { isPdfSafeLogo } from './companyLogo';

export const FILTER_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Last 7 Days',
  month: 'This Month',
  custom: 'Custom Range',
};

const pad = (n) => String(n).padStart(2, '0');

export const toIsoDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The date window a filter covers. Mirrors the backend filters in
// AttendanceController::getRawAttendanceData so labels never lie about the data.
export const resolveRange = (filter, range = {}) => {
  const today = new Date();

  if (filter === 'custom') {
    return { start: range.start || '', end: range.end || '' };
  }
  if (filter === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { start: toIsoDate(y), end: toIsoDate(y) };
  }
  if (filter === 'week') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { start: toIsoDate(from), end: toIsoDate(today) };
  }
  if (filter === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: toIsoDate(from), end: toIsoDate(to) };
  }
  return { start: toIsoDate(today), end: toIsoDate(today) };
};

export const describePeriod = (filter, range) => {
  const { start, end } = resolveRange(filter, range);
  const label = FILTER_LABELS[filter] || filter;
  if (!start || !end) return label;
  const human = (iso) => {
    const [y, m, d] = iso.split('-');
    return `${d}-${m}-${y}`;
  };
  return start === end ? `${label} (${human(start)})` : `${label} (${human(start)} to ${human(end)})`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-GB');
};

const formatTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const workedHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return '—';
  const from = new Date(punchIn).getTime();
  const to = new Date(punchOut).getTime();
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) return '—';
  const minutes = Math.round((to - from) / 60000);
  return `${Math.floor(minutes / 60)}h ${pad(minutes % 60)}m`;
};

export const REPORT_COLUMNS = [
  'Employee',
  'Email',
  'Shift',
  'Date',
  'Punch In',
  'Punch Out',
  'Hours',
  'Status',
  'Late',
];

// records: raw /attendance/raw rows. employees: /users rows (used to add a
// "No Record" line for anyone who never punched during the period).
export const buildReportRows = (records = [], employees = []) => {
  const rows = records.map((record) => {
    const user = record.user || {};
    return {
      name: user.name || 'Unknown User',
      email: user.email || '—',
      shift: user.shift?.shift_name || '—',
      date: formatDate(record.date),
      sortKey: `${user.name || ''}|${record.date || ''}`,
      punchIn: formatTime(record.punch_in_time),
      punchOut: formatTime(record.punch_out_time),
      hours: workedHours(record.punch_in_time, record.punch_out_time),
      status: record.status || 'absent',
      late: record.late_mark ? 'Yes' : 'No',
    };
  });

  const seen = new Set(records.map((r) => r.user?.id).filter(Boolean));
  const missing = employees
    .filter((e) => !seen.has(e.id) && e.role !== 'admin' && e.role !== 'superadmin')
    .map((e) => ({
      name: e.name || 'Unknown User',
      email: e.email || '—',
      shift: e.shift?.shift_name || '—',
      date: '—',
      sortKey: `${e.name || ''}|`,
      punchIn: '—',
      punchOut: '—',
      hours: '—',
      status: 'no record',
      late: 'No',
    }));

  return [...rows, ...missing].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
};

export const summarise = (rows) => ({
  employees: new Set(rows.map((r) => r.email)).size,
  records: rows.filter((r) => r.status !== 'no record').length,
  present: rows.filter((r) => r.status === 'present').length,
  late: rows.filter((r) => r.late === 'Yes' || r.status === 'late').length,
  absent: rows.filter((r) => r.status === 'absent' || r.status === 'no record').length,
});

const toCells = (row) => [
  row.name, row.email, row.shift, row.date,
  row.punchIn, row.punchOut, row.hours, row.status, row.late,
];

export const buildFileName = (filter, range, extension) => {
  const { start, end } = resolveRange(filter, range);
  const period = start === end ? start : `${start}_to_${end}`;
  return `attendance-${filter}-${period || 'report'}.${extension}`;
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const exportAttendanceCsv = ({ rows, filter, range, companyName }) => {
  const meta = [
    ['Attendance Report'],
    ['Company', companyName || '—'],
    ['Period', describePeriod(filter, range)],
    ['Generated', new Date().toLocaleString('en-GB')],
    [],
  ];

  const body = [...meta, REPORT_COLUMNS, ...rows.map(toCells)]
    .map((line) => line.map(csvCell).join(','))
    .join('\r\n');

  // BOM so Excel opens UTF-8 names correctly
  downloadBlob(
    new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8;' }),
    buildFileName(filter, range, 'csv')
  );
};

export const exportAttendancePdf = ({ rows, filter, range, companyName, companyLogo }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const totals = summarise(rows);

  // Company logo in the header, scaled into a 46pt box. Anything jsPDF can't
  // rasterise (SVG) is skipped rather than blowing up the whole export.
  let textLeft = 40;
  if (isPdfSafeLogo(companyLogo)) {
    try {
      const props = doc.getImageProperties(companyLogo);
      const box = 46;
      const scale = Math.min(box / props.width, box / props.height);
      const width = props.width * scale;
      const height = props.height * scale;
      doc.addImage(companyLogo, 40, 30, width, height);
      textLeft = 40 + width + 14;
    } catch (err) {
      console.warn('Skipping company logo in PDF:', err);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Attendance Report', textLeft, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(companyName || 'All Employees', textLeft, 62);
  doc.text(describePeriod(filter, range), textLeft, 77);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageWidth - 40, 62, { align: 'right' });
  doc.text(
    `Employees: ${totals.employees}   Records: ${totals.records}   Present: ${totals.present}   Late: ${totals.late}   Absent: ${totals.absent}`,
    pageWidth - 40,
    77,
    { align: 'right' }
  );

  autoTable(doc, {
    startY: 92,
    head: [REPORT_COLUMNS],
    body: rows.map(toCells),
    styles: { fontSize: 8.5, cellPadding: 5, textColor: [51, 65, 85] },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      6: { halign: 'right' },
      8: { halign: 'center' },
    },
    didDrawPage: () => {
      const { pageSize } = doc.internal;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth - 40,
        pageSize.getHeight() - 18,
        { align: 'right' }
      );
    },
  });

  doc.save(buildFileName(filter, range, 'pdf'));
};
