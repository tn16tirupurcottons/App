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
            className="w-full border border-white/20 bg-transparent rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40"
          />
        </div>
      }
    >
      <div className="bg-graphite/80 border border-white/10 rounded-3xl p-4 text-white">
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <div className="p-6 text-center text-red-300">
            Unable to load users.
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-white/60">No users yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/50 uppercase text-xs tracking-[0.3em]">
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="p-3">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-white/50 text-xs">{user.email}</p>
                    </td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3">{user.orderCount}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRoleToggle(user)}
                        disabled={roleMutation.isPending}
                        className="px-3 py-1 rounded-full border border-white/30 text-xs uppercase tracking-[0.3em]"
                      >
                        {user.role === "admin" ? "Demote" : "Promote"}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 rounded-full border border-red-400/50 text-xs uppercase tracking-[0.3em] text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-14 bg-white/10 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

