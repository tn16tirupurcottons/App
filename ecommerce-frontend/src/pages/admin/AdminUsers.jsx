import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../admin/components/AdminLayout";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../components/Toast";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminUsers", search],
    queryFn: async () => {
      const res = await axiosClient.get("/admin/users", {
        params: { search, includeOrders: "true" },
      });
      return res.data.items || [];
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) =>
      axiosClient.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.role === "admin"
          ? "User promoted to admin"
          : "User role updated"
      );
      qc.invalidateQueries(["adminUsers"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Unable to update role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success("User removed");
      qc.invalidateQueries(["adminUsers"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Unable to delete user"),
  });

  const handleRoleToggle = (user) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    roleMutation.mutate({ id: user.id, role: nextRole });
  };

  const handleDelete = (user) => {
    if (
      window.confirm(
        `Remove ${user.name}? This will also remove their orders and sessions.`
      )
    ) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <AdminLayout
      title="Team & Users"
      actions={
        <div className="w-full md:w-72">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full border border-border bg-white rounded-full px-4 py-2 text-sm text-dark placeholder:text-muted focus:outline-none focus:border-primary"
          />
        </div>
      }
    >
      <div className="card p-4 md:p-6">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <div className="p-6 text-center text-red-600 font-semibold">
            Unable to load users.
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-muted">No users yet.</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {data.map((user) => (
                <div key={user.id} className="card p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-dark text-base">{user.name}</p>
                    <p className="text-muted text-sm">{user.email}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted">Role: </span>
                      <span className="font-medium text-dark capitalize">{user.role}</span>
                    </div>
                    <div>
                      <span className="text-muted">Orders: </span>
                      <span className="font-medium text-dark">{user.orderCount || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleRoleToggle(user)}
                      disabled={roleMutation.isPending}
                      className="flex-1 px-3 py-2 rounded-full border border-primary bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wide hover:bg-primary hover:text-white transition disabled:opacity-50"
                    >
                      {user.role === "admin" ? "Demote" : "Promote"}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 px-3 py-2 rounded-full border border-red-500 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wide hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted uppercase text-xs tracking-[0.3em] border-b-2 border-border bg-light">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Orders</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-light transition">
                      <td className="p-4">
                        <p className="font-semibold text-dark">{user.name}</p>
                        <p className="text-muted text-xs mt-1">{user.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-dark">{user.orderCount || 0}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => handleRoleToggle(user)}
                            disabled={roleMutation.isPending}
                            className="px-4 py-2 rounded-full border border-primary bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wide hover:bg-primary hover:text-white transition disabled:opacity-50"
                          >
                            {user.role === "admin" ? "Demote" : "Promote"}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deleteMutation.isPending}
                            className="px-4 py-2 rounded-full border border-red-500 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wide hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-14 bg-light rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

