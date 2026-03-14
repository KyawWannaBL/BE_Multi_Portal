import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

type AccountUser = {
  id: string;
  email?: string | null;
  role?: string | null;
  is_blocked?: boolean | null;
};

type AccountControlProps = {
  users?: AccountUser[];
};

async function postJson(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data;
}

export default function AccountControl(props: AccountControlProps) {
  const users = useMemo(
    () => (Array.isArray(props?.users) ? props.users : []),
    [props?.users]
  );

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleChangePassword = async (user: AccountUser) => {
    const newPassword = window.prompt(
      `Enter new password for ${user.email || user.id}`,
      ""
    );
    if (!newPassword) return;

    try {
      setLoadingId(user.id);
      await postJson("/api/admin/account-control/change-password", {
        userId: user.id,
        newPassword,
      });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err?.message || "Password change failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetPassword = async (user: AccountUser) => {
    if (!user.email) {
      toast.error("User email not found");
      return;
    }

    try {
      setLoadingId(user.id);
      await postJson("/api/admin/account-control/reset-password", {
        email: user.email,
      });
      toast.success("Reset password email sent");
    } catch (err: any) {
      toast.error(err?.message || "Reset password failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBlockAccount = async (user: AccountUser, nextBlocked: boolean) => {
    try {
      setLoadingId(user.id);
      await postJson("/api/admin/account-control/block-account", {
        userId: user.id,
        block: nextBlocked,
      });
      toast.success(nextBlocked ? "Account blocked" : "Account unblocked");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || "Block account failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteAccount = async (user: AccountUser) => {
    const ok = window.confirm(`Delete account for ${user.email || user.id}?`);
    if (!ok) return;

    try {
      setLoadingId(user.id);
      await postJson("/api/admin/account-control/delete-account", {
        userId: user.id,
      });
      toast.success("Account deleted");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || "Delete account failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-black uppercase tracking-widest text-white">
        Account Control
      </h2>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B101B]">
        <table className="w-full text-left text-sm text-gray-200">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Blocked</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4">{user.email || "-"}</td>
                <td className="p-4">{user.role || "-"}</td>
                <td className="p-4">{user.is_blocked ? "Yes" : "No"}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={loadingId === user.id}
                      onClick={() => handleChangePassword(user)}
                      className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 disabled:opacity-50"
                    >
                      Change Password
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === user.id}
                      onClick={() => handleResetPassword(user)}
                      className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 disabled:opacity-50"
                    >
                      Reset Password
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === user.id}
                      onClick={() =>
                        handleBlockAccount(user, !Boolean(user.is_blocked))
                      }
                      className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-300 disabled:opacity-50"
                    >
                      {user.is_blocked ? "Unblock Account" : "Block Account"}
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === user.id}
                      onClick={() => handleDeleteAccount(user)}
                      className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 disabled:opacity-50"
                    >
                      Delete Account
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!users.length ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}