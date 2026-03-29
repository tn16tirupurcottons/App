import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import OrderCard from "../components/OrderCard";
import { useToast } from "../components/Toast";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

function initials(name) {
  const raw = String(name || "").trim();
  if (!raw) return "U";
  const parts = raw.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
}

export default function Profile() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [editOpen, setEditOpen] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: "",
    newPassword: "",
  });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [profileError, setProfileError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  const { data: meData, refetch: refetchMe } = useQuery({
    queryKey: ["meProfile"],
    queryFn: async () => {
      const res = await axiosClient.get("/users/me");
      return res.data?.user || null;
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await axiosClient.get("/orders/my-orders");
      return res.data?.items || [];
    },
  });

  const orders = data || [];
  const effectiveUser = meData || user || {};

  React.useEffect(() => {
    setProfileForm({
      name: effectiveUser?.name || "",
      email: effectiveUser?.email || "",
    });
  }, [effectiveUser?.name, effectiveUser?.email]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (savingProfile) return;
    setProfileError("");
    try {
      setSavingProfile(true);
      const res = await axiosClient.put("/users/update-profile", profileForm);
      toast.success(res.data?.message || "Profile updated successfully");
      await refetchMe();
      window.dispatchEvent(new Event("auth-update"));
      return true;
    } catch (error) {
      console.log("API error:", error.response?.data);
      const msg = error.response?.data?.message || error.message || "Failed to update profile";
      setProfileError(msg);
      toast.error(msg);
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (changingPassword) return;
    setPasswordError("");
    try {
      setChangingPassword(true);
      const res = await axiosClient.post("/users/change-password", passwordForm);
      toast.success(res.data?.message || "Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.log("API error:", error.response?.data);
      const msg = error.response?.data?.message || error.message || "Failed to change password";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start md:items-center justify-center w-full px-4 py-4 md:py-12 text-dark">
      <div className="max-w-5xl w-full overflow-x-hidden card p-4 md:p-10 space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Account</p>
          <h2 className="text-3xl font-display mt-2 text-dark">My Profile</h2>
        </div>

        <section className="w-full rounded-xl md:rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-14 w-14 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
                {initials(effectiveUser?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-neutral-500">Name</p>
                <p className="text-base font-semibold text-neutral-900 break-words">
                  {effectiveUser?.name || "—"}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                className="shrink-0 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
                onClick={() => setEditOpen(true)}
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => {
                  logout(() => {
                    navigate("/");
                  });
                }}
                className="shrink-0 rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="text-base font-semibold text-neutral-900 break-all">
                {effectiveUser?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Joined</p>
              <p className="text-base font-semibold text-neutral-900">
                {formatDate(effectiveUser?.joinedAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="w-full rounded-xl md:rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link to="/orders" className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors">My Orders</Link>
            <Link to="/track-order" className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors">Track Order</Link>
            <Link to="/wishlist" className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors">Wishlist</Link>
            <button type="button" className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors text-left">Addresses</button>
            <button type="button" className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors text-left">Payment Methods</button>
          </div>
        </section>

        {editOpen ? (
          <div
            className="fixed inset-0 z-[300] bg-black/40 flex items-center justify-center px-4 py-6"
            onClick={() => setEditOpen(false)}
          >
            <div
              className="w-full max-w-xl card rounded-2xl border border-neutral-200 bg-white p-6 md:p-10 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-neutral-900">Edit Profile</h3>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-neutral-800 hover:bg-neutral-50 transition-colors"
                  aria-label="Close edit profile"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  const ok = await handleProfileSave(e);
                  if (ok) setEditOpen(false);
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
                />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
                />

                <div className="md:col-span-2 flex items-center gap-3 flex-wrap">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save profile"}
                  </button>
                  {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <section className="w-full rounded-xl md:rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-neutral-900">Orders</h3>
            <Link
              to="/orders"
              className="text-sm font-semibold text-primary hover:underline underline-offset-2"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-neutral-100 rounded-xl" />
              <div className="h-20 bg-neutral-100 rounded-xl" />
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">Failed to load orders.</p>
          ) : orders.length ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
              {orders.length > 5 ? (
                <p className="text-xs text-neutral-500">Showing latest 5 orders.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No orders yet.</p>
          )}
        </section>

        <section className="w-full rounded-xl md:rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 space-y-3">
          <h3 className="text-lg font-bold text-neutral-900">Security</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                }
                placeholder="Old password"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="New password"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                {changingPassword ? "Updating..." : "Change password"}
              </button>
              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
            </div>
          </form>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                logout(() => navigate("/"));
              }}
              className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

