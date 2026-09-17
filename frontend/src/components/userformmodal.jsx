import { useState } from "react";
import { LOCATIONS } from "../constants/locations";

const ROLES = ["Sticker Balancing Supervisor", "Executive", "Admin"];

// `initial` is null for "Add User" and a user object for "Edit User".
const UserFormModal = ({ initial, onSubmit, onClose, submitting, error }) => {
  const isEdit = Boolean(initial);

  const [form, setForm] = useState({
    userName: initial?.userName || "",
    role: initial?.role || ROLES[0],
    location: initial?.location || LOCATIONS[0],
    isActive: initial?.isActive ?? true,
    password: "",
  });

  const handleChange = (field) => (e) => {
    const value = field === "isActive" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      userName: form.userName.trim(),
      role: form.role,
      location: form.location,
      isActive: form.isActive,
    };
    // Blank password on edit = leave it unchanged; required on create.
    if (form.password) payload.password = form.password;
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? `Edit ${initial.userName}` : "Add User"}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="userName">
              User Name
            </label>
            <input
              id="userName"
              type="text"
              value={form.userName}
              onChange={handleChange("userName")}
              required
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="role">
                Role
              </label>
              <select id="role" value={form.role} onChange={handleChange("role")}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="location">
                Location
              </label>
              <select id="location" value={form.location} onChange={handleChange("location")}>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">
              {isEdit ? "Reset Password (leave blank to keep current)" : "Initial Password"}
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required={!isEdit}
              minLength={6}
            />
          </div>

          {isEdit && (
            <label className="checkbox-row">
              <input type="checkbox" checked={form.isActive} onChange={handleChange("isActive")} />
              Active
            </label>
          )}

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;