import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import UserFormModal from "../components/UserFormModal";
import { listUsers, createUser, updateUser, deleteUser } from "../api/users.api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const AdminUsers = () => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // undefined = modal closed, null = "Add User" mode, object = "Edit User" mode
  const [modalUser, setModalUser] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (payload) => {
    setFormError("");
    setSubmitting(true);
    try {
      if (modalUser) {
        await updateUser(modalUser._id, payload);
        showToast("User updated");
      } else {
        await createUser(payload);
        showToast("User created");
      }
      setModalUser(undefined);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (!window.confirm(`Deactivate ${u.userName}? They will no longer be able to log in.`)) {
      return;
    }
    try {
      await deleteUser(u._id);
      showToast("User deactivated");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not deactivate user.", "error");
    }
  };

  return (
    <div className="page">
      <Navbar title="Manage Users" />
      <main className="page-content">
        <div className="page-nav">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormError("");
              setModalUser(null);
            }}
          >
            Add User
          </button>
        </div>

        <div className="card">
          {loading && <p className="muted">Loading...</p>}

          {!loading && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="mono">{u.userId}</td>
                    <td>{u.userName}</td>
                    <td>{u.role}</td>
                    <td>{u.location}</td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-ok" : "badge-recheck"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setFormError("");
                            setModalUser(u);
                          }}
                        >
                          Edit
                        </button>
                        {u._id !== currentUser._id && u.isActive && (
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleDeactivate(u)}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modalUser !== undefined && (
        <UserFormModal
          initial={modalUser}
          onSubmit={handleSubmit}
          onClose={() => setModalUser(undefined)}
          submitting={submitting}
          error={formError}
        />
      )}
    </div>
  );
};

export default AdminUsers;