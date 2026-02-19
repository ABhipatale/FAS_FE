import { Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  ScanFace,
  Camera,
  Users,
  User
} from "lucide-react";
import LinesBackground from '../3D/LinesBackground';
import { useEffect } from "react";
import gsap from "gsap";

export default function AdminDashboard() {

  useEffect(() => {
    const buttons = document.querySelectorAll(".glass-btn");

    buttons.forEach((btn) => {
      const overlay = btn.querySelector(".hover-overlay");

      const directions = [
        { x: "-100%", y: "0%" },   // left
        { x: "100%", y: "0%" },    // right
        { x: "0%", y: "-100%" },   // top
        { x: "0%", y: "100%" }     // bottom
      ];

      btn.addEventListener("mouseenter", () => {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        gsap.set(overlay, { x: dir.x, y: dir.y, opacity: 1 });
        gsap.to(overlay, { x: "0%", y: "0%", duration: 0.4, ease: "power2.out" });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(overlay, { opacity: 0, duration: 0.3 });
      });
    });
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-blue-950">

      <LinesBackground />


      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center m-4">
        <h1 className="text-3xl font-bold text-white mb-6">
          Face Attendance System
        </h1>

        <div className="space-y-4">
          {/* 🌆 Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 rounded-2xl"
            style={{
              backgroundImage:
               "url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop')"
,
              animation: "bgZoom 30s ease-in-out infinite alternate"
            }}
          />

          <p className="text-blue-100 mb-6">
            Welcome to the Face Attendance System. Please login or register to continue.
          </p>

          <div className="flex flex-col space-y-4">

            {/* Button Template */}
            {[
              { to: "/login", icon: <LogIn size={18} />, text: "Login", color: "from-indigo-600 to-indigo-500" },
              { to: "/register", icon: <UserPlus size={18} />, text: "Register", color: "from-emerald-600 to-teal-500" },
              { to: "/face-attendance", icon: <ScanFace size={18} />, text: "Face Attendance", color: "from-violet-600 to-fuchsia-500" },
              { to: "/face-registration", icon: <Camera size={18} />, text: "Register Face", color: "from-amber-600 to-orange-500" },
              { to: "/user-management", icon: <Users size={18} />, text: "Manage Users", color: "from-slate-700 to-slate-600" },
              { to: "/employee-login", icon: <User size={18} />, text: "Employee Login", color: "from-rose-600 to-pink-500" },
            ].map((btn, i) => (
              <Link
                key={i}
                to={btn.to}
                className="glass-btn relative overflow-hidden w-full text-white py-3 rounded-lg border  transition flex items-center justify-center gap-2 backdrop-blur-md bg-white/30  shadow-lg"
              >
                {/* Hover overlay */}
                <span className={`hover-overlay absolute inset-0 opacity-0 bg-gradient-to-r ${btn.color}`} />

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  {btn.icon} {btn.text}
                </span>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
