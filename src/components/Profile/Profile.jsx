import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Camera, Mail, Phone, Building2, BadgeCheck } from "lucide-react";
import EditProfile from "./EditProfile"; 

const Profile = () => {
    const pageRef = useRef(null);
    const [showEdit, setShowEdit] = useState(false); 

    // Dummy data — replace with backend data
    const user = {
        id: "EMP-1024",
        name: "Aarav Mehta",
        role: "Software Engineer",
        department: "AI & Vision",
        email: "aarav.mehta@company.com",
        phone: "+91 98765 43210",
        avatar: "https://i.pravatar.cc/300",
        attendance: {
            present: 21,
            absent: 1,
            late: 2,
        },

    
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from("#profile-card", {
                y: 40,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
            });

            gsap.from("#info-section > *", {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: "power2.out",
                delay: 0.2,
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={pageRef}
            id="profile-page"
            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6"
        >
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div
                    id="profile-card"
                    className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-6 flex flex-col items-center text-center"
                >
                    <div id="avatar-wrapper" className="relative group">
                        <img
                            id="profile-avatar"
                            src={user.avatar}
                            alt="avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                        />
                        <button
                            id="change-photo-btn"
                            className="absolute bottom-1 right-1 bg-indigo-600 p-2 rounded-full shadow-lg transform transition group-hover:scale-110"
                        >
                            <Camera size={16} />
                        </button>
                    </div>

                    <h2 id="user-name" className="mt-4 text-2xl font-semibold">
                        {user.name}
                    </h2>
                    <p id="user-role" className="text-indigo-400">
                        {user.role}
                    </p>

                    <div
                        id="employee-id"
                        className="mt-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-sm flex items-center gap-1"
                    >
                        <BadgeCheck size={14} /> {user.id}
                    </div>

                    {/* ✅ FIXED BUTTON */}
                    <button
                        id="edit-profile-btn"
                        onClick={() => setShowEdit(true)}
                        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-2 font-medium transition"
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Info Section */}
                <div
                    id="info-section"
                    className="lg:col-span-2 grid md:grid-cols-2 gap-6"
                >
                    {/* Contact Info */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4">
                        <h3 id="contact-title" className="text-lg font-semibold">
                            Contact Information
                        </h3>

                        <div id="email-field" className="flex items-center gap-3">
                            <Mail className="text-indigo-400" />
                            <span>{user.email}</span>
                        </div>

                        <div id="phone-field" className="flex items-center gap-3">
                            <Phone className="text-indigo-400" />
                            <span>{user.phone}</span>
                        </div>

                        <div id="department-field" className="flex items-center gap-3">
                            <Building2 className="text-indigo-400" />
                            <span>{user.department}</span>
                        </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                        <h3 id="attendance-title" className="text-lg font-semibold mb-4">
                            Attendance Overview
                        </h3>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div
                                id="present-count"
                                className="p-4 rounded-xl bg-emerald-500/10 hover:scale-105 transition"
                            >
                                <p className="text-2xl font-bold text-emerald-400">
                                    {user.attendance.present}
                                </p>
                                <p className="text-sm text-white/70">Present</p>
                            </div>

                            <div
                                id="absent-count"
                                className="p-4 rounded-xl bg-rose-500/10 hover:scale-105 transition"
                            >
                                <p className="text-2xl font-bold text-rose-400">
                                    {user.attendance.absent}
                                </p>
                                <p className="text-sm text-white/70">Absent</p>
                            </div>

                            <div
                                id="late-count"
                                className="p-4 rounded-xl bg-amber-500/10 hover:scale-105 transition"
                            >
                                <p className="text-2xl font-bold text-amber-400">
                                    {user.attendance.late}
                                </p>
                                <p className="text-sm text-white/70">Late</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ MODAL RENDER (no layout changes) */}
            {showEdit && (
                <EditProfile
                    user={user}
                    onSave={(data) => {
                        console.log("Updated data:", data);
                        setShowEdit(false);
                    }}
                    onCancel={() => setShowEdit(false)}
                />
            )}
        </div>
    );
};

export default Profile;
