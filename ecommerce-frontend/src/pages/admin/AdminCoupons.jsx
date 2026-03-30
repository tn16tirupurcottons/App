import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../components/Toast";

const initialForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  max_discount: "",
  min_order_amount: "",
  is_insider_only: false,
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

export default function AdminCoupons() {
  const qc = useQueryClient();
  const toast = useToast();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/coupons");
      return res.data?.items || [];
    },
  });

  const coupons = data || [];

  const createMutation = useMutation({
    mutationFn: (payload) => axiosClient.post("/admin/coupons", payload),
    onSuccess: () => {
      toast.success("Coupon created");
      setForm(initialForm);
      setEditingId(null);
      setError("");
      qc.invalidateQueries({ queryKey: ["adminCoupons"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => axiosClient.put(`/admin/coupons/${id}`, payload),
    onSuccess: () => {
      toast.success("Coupon updated");
      setForm(initialForm);
      setEditingId(null);
      setError("");
      qc.invalidateQueries({ queryKey: ["adminCoupons"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update coupon");
    },
  });

  const payload = useMemo(() => {
    const toNullableNumber = (v) => {
      const s = String(v ?? "").trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    return {
      code: String(form.code || "").trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_discount: toNullableNumber(form.max_discount),
      min_order_amount: Number(form.min_order_amount),
      is_insider_only: Boolean(form.is_insider_only),
      usage_limit: toNullableNumber(form.usage_limit),
      expires_at: form.expires_at ? form.expires_at : null,
      is_active: Boolean(form.is_active),
    };
  }, [form]);

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code || "",
      discount_type: c.discount_type || "percentage",
      discount_value: String(c.discount_value ?? ""),
      max_discount: c.max_discount == null ? "" : String(c.max_discount),
      min_order_amount: String(c.min_order_amount ?? ""),
      is_insider_only: Boolean(c.is_insider_only),
      usage_limit: c.usage_limit == null ? "" : String(c.usage_limit),
      expires_at: c.expires_at ? String(new Date(c.expires_at).toISOString().slice(0, 16)) : "",
      is_active: Boolean(c.is_active),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!payload.code) return setError("Code is required");
    if (editingId) updateMutation.mutate({ id: editingId, payload });
    else createMutation.mutate(payload);
  };

  return (
    <AdminLayout title="Coupons">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-4 md:p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              {editingId ? "Edit coupon" : "Create coupon"}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              {error ? (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-xs text-neutral-600 font-semibold">Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                  placeholder="e.g. INSIDER"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-semibold">Discount type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                  >
                    <option value="percentage">percentage</option>
                    <option value="flat">flat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-semibold">Discount value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                    placeholder={form.discount_type === "percentage" ? "10" : "100"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-semibold">Max discount (cap)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.max_discount}
                    onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                    placeholder="optional"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-semibold">Min order amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.min_order_amount}
                    onChange={(e) => setForm((p) => ({ ...p, min_order_amount: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={form.is_insider_only}
                    onChange={(e) => setForm((p) => ({ ...p, is_insider_only: e.target.checked }))}
                  />
                  Insider-only coupon
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-semibold">Usage limit (global)</label>
                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                    placeholder="optional"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-semibold">Expires at</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                    className="w-full border border-neutral-200 bg-white rounded-full px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                  Active
                </label>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
              >
                {editingId ? "Update coupon" : "Create coupon"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                    setError("");
                  }}
                  className="w-full rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition"
                >
                  Cancel edit
                </button>
              ) : null}
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-4 md:p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">All coupons</h2>

            {isLoading ? (
              <Skeleton />
            ) : isError ? (
              <div className="p-6 text-center text-red-600 font-semibold">
                Unable to load coupons.
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-6 text-center text-neutral-600">No coupons yet.</div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-600 uppercase text-xs tracking-[0.3em] border-b border-neutral-200">
                        <th className="p-3">Code</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Min</th>
                        <th className="p-3">Insider</th>
                        <th className="p-3">Usage</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition">
                          <td className="p-3">
                            <div className="font-semibold text-neutral-900">{c.code}</div>
                            <div className="text-xs text-neutral-600">{c.is_active ? "Active" : "Inactive"}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-neutral-900">
                              {c.discount_type === "percentage"
                                ? `${c.discount_value}%`
                                : `₹${Math.round(Number(c.discount_value || 0))}`}
                              {c.max_discount != null ? (
                                <span className="text-xs text-neutral-600 ml-2">
                                  cap ₹{Math.round(Number(c.max_discount))}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-3 text-neutral-600">{c.min_order_amount ?? 0}</td>
                          <td className="p-3">
                            {c.is_insider_only ? (
                              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-xs font-semibold">
                                Yes
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-neutral-50 text-neutral-600 text-xs font-semibold">
                                No
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-neutral-900">
                              {c.used_count ?? 0}
                              <span className="text-xs text-neutral-600 ml-2">
                                {c.usage_limit != null ? `/ ${c.usage_limit}` : "(∞)"}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleEdit(c)}
                              className="text-neutral-900 hover:underline text-xs font-semibold"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile list */}
                <div className="md:hidden space-y-3">
                  {coupons.map((c) => (
                    <div key={c.id} className="card p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-neutral-900">{c.code}</p>
                          <p className="text-xs text-neutral-600">{c.is_active ? "Active" : "Inactive"}</p>
                        </div>
                        <button
                          onClick={() => handleEdit(c)}
                          className="px-3 py-2 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-neutral-700">
                        {c.discount_type === "percentage"
                          ? `${c.discount_value}%`
                          : `₹${Math.round(Number(c.discount_value || 0))}`}
                        {c.max_discount != null ? ` (cap ₹${Math.round(Number(c.max_discount))})` : ""}
                      </p>
                      <p className="text-sm text-neutral-700">
                        Min order: ₹{Math.round(Number(c.min_order_amount || 0))}
                      </p>
                      <p className="text-sm text-neutral-700">
                        Insider only: {c.is_insider_only ? "Yes" : "No"}
                      </p>
                      <p className="text-sm text-neutral-700">
                        Used: {c.used_count ?? 0}
                        {c.usage_limit != null ? ` / ${c.usage_limit}` : " (∞)"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-14 bg-neutral-50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

