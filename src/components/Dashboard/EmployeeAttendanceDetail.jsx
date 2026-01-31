// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { apiCall } from "../../config/api";

// export default function EmployeeAttendanceDetail() {

//   const { userId } = useParams();
//   const navigate = useNavigate();

//   const [employee, setEmployee] = useState({});
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());

//   useEffect(() => {
//     if (!userId || isNaN(userId)) navigate("/");
//   }, [userId]);

//   useEffect(() => {
//     loadData();
//   }, [month, year]);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const user = await apiCall(`/users/${userId}`);
//       const att = await apiCall(`/attendance/user/${userId}?month=${month}&year=${year}`);

//       setEmployee(user.data.data || {});
//       setRecords(att.data.data?.monthly || []);
//     } catch {
//       setRecords([]);
//     }
//     setLoading(false);
//   };

//   // ================= FULL MONTH CALENDAR ==================

//   const buildCalendar = () => {
//     const daysInMonth = new Date(year, month, 0).getDate();

//     const recordMap = {};

//     records.forEach(r => {
//       const key = new Date(r.date).toISOString().slice(0, 10);
//       recordMap[key] = r;
//     });

//     const calendar = [];

//     for (let d = 1; d <= daysInMonth; d++) {
//       const dateObj = new Date(year, month - 1, d);
//       const key = dateObj.toISOString().slice(0, 10);

//       calendar.push(
//         recordMap[key] || {
//           date: key,
//           status: "absent",
//         }
//       );
//     }

//     return calendar;
//   };

//   const calendarDays = buildCalendar();

//   // ================= STATS ==================

//   const stats = {
//     present: calendarDays.filter(r => r.status === "present").length,
//     absent: calendarDays.filter(r => r.status === "absent").length,
//     late: calendarDays.filter(r => r.status === "late").length,
//     leave: calendarDays.filter(r => r.status === "leave").length,
//   };

//   const rate = calendarDays.length
//     ? (((stats.present + stats.late) / calendarDays.length) * 100).toFixed(1)
//     : 0;

//   return (
//     <div className="page">

// <style>{`
// :root{
// --primary:#2563eb;
// --bg:#f8fafc;
// --border:#e5e7eb;
// --muted:#64748b;
// }

// *{box-sizing:border-box;font-family:Inter}

// .page{background:var(--bg);min-height:100vh;padding:30px}
// .container{max-width:1200px;margin:auto}

// header{display:flex;justify-content:space-between;margin-bottom:20px}

// select,button{
// padding:8px 14px;
// border-radius:6px;
// border:1px solid var(--border);
// background:white
// }

// .card{
// background:white;
// border:1px solid var(--border);
// border-radius:10px;
// padding:20px;
// margin-bottom:20px
// }

// .employee{display:flex;gap:16px}
// .avatar{
// width:60px;height:60px;border-radius:8px;
// background:var(--primary);color:white;
// display:flex;align-items:center;justify-content:center;
// font-size:22px;font-weight:700
// }

// .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}

// .stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}

// .stat{border:1px solid var(--border);padding:16px;border-radius:8px}
// .stat h4{margin:0;color:var(--muted)}
// .stat strong{font-size:28px}

// .rate{
// margin-top:12px;
// background:var(--primary);
// color:white;
// padding:18px;
// border-radius:8px;
// text-align:center
// }

// .calendar{
// display:grid;
// grid-template-columns:repeat(7,1fr);
// gap:6px;
// margin-top:12px
// }

// .day{
// border:1px solid var(--border);
// padding:10px;
// border-radius:6px;
// text-align:center
// }

// .present{background:#dcfce7}
// .absent{background:#fee2e2}
// .late{background:#fef9c3}
// .leave{background:#dbeafe}

// table{width:100%;border-collapse:collapse}
// th,td{padding:12px;border-bottom:1px solid var(--border)}
// th{background:#f1f5f9}

// .badge{
// padding:4px 10px;border-radius:6px;font-weight:600
// }

// @media(max-width:900px){
// .grid{grid-template-columns:1fr}
// }
// `}</style>

// <div className="container">

// <header>
// <button onClick={()=>navigate(-1)}>← Back</button>

// <div>
// <select value={month} onChange={e=>setMonth(e.target.value)}>
// {Array.from({length:12}).map((_,i)=>(
// <option key={i+1} value={i+1}>
// {new Date(0,i).toLocaleString("default",{month:"long"})}
// </option>
// ))}
// </select>

// <select value={year} onChange={e=>setYear(e.target.value)}>
// {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
// </select>
// </div>
// </header>

// <div className="card employee">
// <div className="avatar">{employee?.name?.[0]||"E"}</div>
// <div>
// <h2>{employee?.name}</h2>
// <p>{employee?.department}</p>
// </div>
// </div>

// <div className="grid">

// <div>
// <div className="stats">
// <div className="stat"><h4>Present</h4><strong>{stats.present}</strong></div>
// <div className="stat"><h4>Absent</h4><strong>{stats.absent}</strong></div>
// <div className="stat"><h4>Late</h4><strong>{stats.late}</strong></div>
// <div className="stat"><h4>Leave</h4><strong>{stats.leave}</strong></div>
// </div>

// <div className="rate">
// <h1>{rate}%</h1>
// <p>Attendance Rate</p>
// </div>
// </div>

// <div className="card">
// <h3>Calendar</h3>

// <div className="calendar">
// {calendarDays.map((r,i)=>(
// <div key={i} className={`day ${r.status}`}>
// {new Date(r.date).getDate()}
// </div>
// ))}
// </div>

// </div>
// </div>

// <div className="card">
// <h3>Attendance Records</h3>

// <table>
// <thead>
// <tr>
// <th>Date</th>
// <th>Status</th>
// <th>In</th>
// <th>Out</th>
// <th>Hours</th>
// </tr>
// </thead>

// <tbody>
// {calendarDays.map((r,i)=>(
// <tr key={i}>
// <td>{r.date}</td>
// <td><span className={`badge ${r.status}`}>{r.status}</span></td>
// <td>{r.punch_in_time||"—"}</td>
// <td>{r.punch_out_time||"—"}</td>
// <td>{r.hours_worked||"—"}</td>
// </tr>
// ))}
// </tbody>
// </table>

// </div>

// </div>
// </div>
// );
// }
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall } from "../../config/api";

export default function EmployeeAttendanceDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!userId || isNaN(userId)) navigate("/");
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await apiCall(`/users/${userId}`);
      const att = await apiCall(`/attendance/user/${userId}?month=${month}&year=${year}`);
      setEmployee(user.data.data || {});
      setRecords(att.data.data?.monthly || []);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  };

  // ================= CALENDAR BUILD =================
  const buildCalendar = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const recordMap = {};
    records.forEach(r => {
      const key = new Date(r.date).toISOString().slice(0, 10);
      recordMap[key] = r;
    });
    const calendar = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month - 1, d);
      const key = dateObj.toISOString().slice(0, 10);
      calendar.push(recordMap[key] || { date: key, status: "absent" });
    }
    return calendar;
  };

  const calendarDays = buildCalendar();

  // ================= STATS =================
  const stats = {
    present: calendarDays.filter(r => r.status === "present").length,
    absent: calendarDays.filter(r => r.status === "absent").length,
    late: calendarDays.filter(r => r.status === "late").length,
    leave: calendarDays.filter(r => r.status === "leave").length,
  };

  const rate = calendarDays.length
    ? (((stats.present + stats.late) / calendarDays.length) * 100).toFixed(1)
    : 0;

  const monthName = new Date(0, month - 1).toLocaleString("default", { month: "long" });
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get the weekday of the 1st day of the month (0=Sun)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  // Status config
  const statusConfig = {
    present: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Present" },
    absent:  { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Absent" },
    late:    { color: "#ca8a04", bg: "#fefce8", border: "#fde047", label: "Late" },
    leave:   { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Leave" },
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loaderWrap}>
          <div style={styles.loader}></div>
          <p style={{ color: "#64748b", marginTop: 16, fontFamily: "'Segoe UI', sans-serif" }}>Loading attendance data...</p>
        </div>
        <style>{loaderCSS}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>

      {/* ===== TOP BANNER ===== */}
      {/* <div style={styles.banner}>
        <div style={styles.bannerInner}>
          <div style={styles.bannerLeft}>
            <div style={styles.bannerIcon}>📋</div>
            <div>
              <h1 style={styles.bannerTitle}>Attendance Report</h1>
              <p style={styles.bannerSub}>Employee Performance & Tracking Dashboard</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <span style={{ marginRight: 6 }}>←</span> Back
          </button>
        </div>
      </div> */}

      <div style={styles.container}>

        {/* ===== EMPLOYEE PROFILE STRIP ===== */}
        <div style={styles.profileCard}>
          <div style={styles.profileAvatar}>
            <span style={styles.avatarLetter}>{employee?.name?.[0] || "E"}</span>
          </div>
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>{employee?.name || "—"}</h2>
            <div style={styles.profileMeta}>
              <span style={styles.metaBadge}>
                <span style={{ marginRight: 4 }}>🏢</span> {employee?.department || "—"}
              </span>
              <span style={styles.metaDivider}>|</span>
              <span style={styles.metaBadge}>
                <span style={{ marginRight: 4 }}>📅</span> {monthName} {year}
              </span>
            </div>
          </div>
          <div style={styles.profileControls}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={styles.select}>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={styles.select}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* ===== STATS ROW ===== */}
        <div style={styles.statsRow}>
          {[
            { key: "present", icon: "✓", color: "#16a34a", bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)" },
            { key: "absent",  icon: "✗", color: "#dc2626", bg: "linear-gradient(135deg, #fef2f2, #fee2e2)" },
            { key: "late",    icon: "⏰", color: "#ca8a04", bg: "linear-gradient(135deg, #fefce8, #fef08a)" },
            { key: "leave",   icon: "📄", color: "#2563eb", bg: "linear-gradient(135deg, #eff6ff, #dbeafe)" },
          ].map(s => (
            <div key={s.key} style={{ ...styles.statCard, background: s.bg }}>
              <div style={{ ...styles.statIcon, color: s.color }}>{s.icon}</div>
              <div style={styles.statLabel}>{statusConfig[s.key].label}</div>
              <div style={{ ...styles.statValue, color: s.color }}>{stats[s.key]}</div>
            </div>
          ))}

          {/* Rate Card */}
          <div style={styles.rateCard}>
            <div style={styles.rateCircleBg}>
              <div style={styles.rateCircle}>
                <span style={styles.rateValue}>{rate}%</span>
              </div>
            </div>
            <div style={styles.rateLabel}>Attendance Rate</div>
          </div>
        </div>

        {/* ===== CALENDAR + TABLE ROW ===== */}
        <div style={styles.mainGrid}>

          {/* Calendar */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <span style={{ marginRight: 8 }}>📆</span> Monthly Calendar
              </h3>
            </div>

            {/* Legend */}
            <div style={styles.legend}>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <div key={key} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: cfg.color }}></span>
                  <span style={styles.legendText}>{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Day headers */}
            <div style={styles.calGrid}>
              {dayLabels.map(d => (
                <div key={d} style={styles.calDayHeader}>{d}</div>
              ))}

              {/* Spacer cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={"sp" + i} style={styles.calEmpty}></div>
              ))}

              {/* Day cells */}
              {calendarDays.map((r, i) => {
                const cfg = statusConfig[r.status] || statusConfig.absent;
                const dayNum = new Date(r.date + "T00:00:00").getDate();
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.calDay,
                      background: cfg.bg,
                      border: `1.5px solid ${cfg.border}`,
                    }}
                  >
                    <div style={styles.calDayNum}>{dayNum}</div>
                    <div style={{ ...styles.calDayDot, background: cfg.color }}></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Table */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <span style={{ marginRight: 8 }}>📝</span> Attendance Records
              </h3>
              <span style={styles.recordCount}>{calendarDays.length} Days</span>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Date", "Status", "Check In", "Check Out", "Hours"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarDays.map((r, i) => {
                    const cfg = statusConfig[r.status] || statusConfig.absent;
                    return (
                      <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.td}>{formatDate(r.date)}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                          }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td style={styles.td}>{r.punch_in_time || "—"}</td>
                        <td style={styles.td}>{r.punch_out_time || "—"}</td>
                        <td style={{ ...styles.td, fontWeight: 600, color: "#1e293b" }}>{r.hours_worked || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ========================= STYLES =========================
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
  },

  // Loader
  loaderWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loader: {
    width: 44,
    height: 44,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  // Banner
  banner: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)",
    padding: "28px 32px",
    boxShadow: "0 4px 24px rgba(30,58,95,0.35)",
  },
  bannerInner: {
    maxWidth: 1140,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  bannerIcon: {
    fontSize: 32,
    background: "rgba(255,255,255,0.13)",
    width: 56,
    height: 56,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    margin: 0,
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
  bannerSub: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  backBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.2s",
  },

  // Container
  container: {
    maxWidth: 1140,
    margin: "0 auto",
    padding: "28px 24px 48px",
  },

  // Profile
  profileCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    marginBottom: 24,
    border: "1px solid #e2e8f0",
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
  },
  profileMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  metaBadge: {
    fontSize: 13,
    color: "#475569",
    background: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
  },
  metaDivider: {
    color: "#cbd5e1",
  },
  profileControls: {
    display: "flex",
    gap: 10,
  },
  select: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    appearance: "auto",
  },

  // Stats Row
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 12,
    padding: "18px 16px",
    textAlign: "center",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 600,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  rateCard: {
    background: "linear-gradient(135deg, #1e3a5f, #1e40af)",
    borderRadius: 12,
    padding: "18px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(30,58,95,0.3)",
  },
  rateCircleBg: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rateCircle: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rateValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
  },
  rateLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginTop: 8,
    fontWeight: 600,
  },

  // Main Grid
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: 20,
    alignItems: "start",
  },

  // Card
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 22px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: "1px solid #f1f5f9",
  },
  cardTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
  },
  recordCount: {
    fontSize: 12,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 600,
  },

  // Legend
  legend: {
    display: "flex",
    gap: 14,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  legendText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500,
  },

  // Calendar Grid
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 5,
  },
  calDayHeader: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    paddingBottom: 8,
  },
  calEmpty: {},
  calDay: {
    borderRadius: 8,
    padding: "8px 4px 6px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    transition: "transform 0.15s",
    cursor: "default",
  },
  calDayNum: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1e293b",
    lineHeight: 1,
  },
  calDayDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
  },

  // Table
  tableWrap: {
    overflowY: "auto",
    maxHeight: 420,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "11px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 1,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 14px",
    fontSize: 13,
    color: "#475569",
    whiteSpace: "nowrap",
  },
  trEven: { background: "#fff" },
  trOdd: { background: "#f8fafc" },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.3px",
  },
};

// ========================= CSS STRINGS =========================
const globalCSS = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  select:focus, button:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.25); }
  button:hover { opacity: 0.85; }
  select:hover { border-color: #94a3b8; }
  .cal-day:hover { transform: scale(1.06); }
  @media (max-width: 900px) {
    .stats-row { grid-template-columns: repeat(3, 1fr) !important; }
    .main-grid { grid-template-columns: 1fr !important; }
  }
`;

const loaderCSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;