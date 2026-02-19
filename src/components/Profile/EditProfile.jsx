import React, { useState } from "react";
import gsap from "gsap";

const EditProfile = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
    department: user?.department || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send updated data to parent / API
    if (onSave) onSave(formData);
  };

  return (
    <div
      id="edit-profile-modal"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        id="edit-profile-container"
        className="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 p-6"
      >
        <h2 id="edit-profile-title" className="text-2xl font-semibold mb-6">
          Edit Profile
        </h2>

        <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-sm text-white/70">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="text-sm text-white/70">
              Role
            </label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="text-sm text-white/70">
              Department
            </label>
            <input
              id="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm text-white/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="text-sm text-white/70">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              id="cancel-edit-btn"
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
            >
              Cancel
            </button>

            <button
              id="save-profile-btn"
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
