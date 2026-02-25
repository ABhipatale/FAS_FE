import { useState } from "react";

export default function SettingsPage() {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [lateAlerts, setLateAlerts] = useState(false);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [twoFA, setTwoFA] = useState(false);
    const [autoCapture, setAutoCapture] = useState(true);

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Settings
                    </h1>
                </div>

                {/* Profile */}
                <Card title="Profile">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg shadow">
                            V
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-slate-800">
                                Virat Kohli
                            </p>
                            <p className="text-sm text-slate-500">virat@gmail.com</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-300 transition">
                            Change Photo
                        </button>
                    </div>
                </Card>

                {/* Face Recognition */}
                <Card title="Face Recognition">
                    <Row>
                        <span>Re-register Face</span>
                        <button className="btn-primary">Re-register</button>
                    </Row>

                    <Row>
                        <span>Detection Sensitivity</span>
                        <select className="input">
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </Row>

                    <Row>
                        <span>Auto Capture</span>
                        <Toggle enabled={autoCapture} setEnabled={setAutoCapture} />
                    </Row>
                </Card>

                {/* Attendance Rules */}
                <Card title="Attendance Rules">
                    <Row>
                        <span>Office Start Time</span>
                        <input type="time" defaultValue="09:00" className="input" />
                    </Row>

                    <Row>
                        <span>Late After (minutes)</span>
                        <input type="number" defaultValue="15" className="input" />
                    </Row>

                    <Row>
                        <span>Work Hours / Day</span>
                        <input type="number" defaultValue="8" className="input" />
                    </Row>
                </Card>

                {/* Notifications */}
                <Card title="Notifications">
                    <Row>
                        <span>Email Alerts</span>
                        <Toggle enabled={emailAlerts} setEnabled={setEmailAlerts} />
                    </Row>

                    <Row>
                        <span>Late Alerts</span>
                        <Toggle enabled={lateAlerts} setEnabled={setLateAlerts} />
                    </Row>

                    <Row>
                        <span>Weekly Report</span>
                        <Toggle enabled={weeklyReport} setEnabled={setWeeklyReport} />
                    </Row>
                </Card>

                {/* Security */}
                <Card title="Security">
                    <Row>
                        <span>Change Password</span>
                        <button className="btn-secondary">Update</button>
                    </Row>

                    <Row>
                        <span>Two-Factor Authentication</span>
                        <Toggle enabled={twoFA} setEnabled={setTwoFA} />
                    </Row>

                    <Row>
                        <span>Logout all devices</span>
                        <button className="btn-danger">Logout</button>
                    </Row>
                </Card>

            </div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4">
                {title}
            </h2>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Row({ children }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-slate-600">
            {children}
        </div>
    );
}

function Toggle({ enabled, setEnabled }) {
    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300
            ${enabled ? "bg-blue-600" : "bg-slate-300"}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300
                ${enabled ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    );
}