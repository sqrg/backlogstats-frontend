import { useState, type FormEvent } from "react";
import { PageShell } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { updateMe, changePassword } from "../api/users";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfilePage() {
  const { profile, logout, refreshProfile } = useAuth();

  // Username form
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    setUsernameError(null);
    setUsernameSuccess(false);
    setIsSavingUsername(true);
    try {
      await updateMe({ username: username.trim() });
      await refreshProfile();
      setUsernameSuccess(true);
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : "Failed to save username");
    } finally {
      setIsSavingUsername(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  }

  const PROVIDERS = [
    { key: "google_id", label: "Google" },
    { key: "discord_id", label: "Discord" },
    { key: "apple_id", label: "Apple" },
    { key: "steam_id", label: "Steam" },
  ] as const;

  return (
    <PageShell>
      <div className="max-w-lg mx-auto mt-8 flex flex-col gap-8">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Set username banner */}
        {profile && !profile.username && (
          <div className="border border-amber-200 bg-amber-50 rounded p-3 text-sm text-amber-800">
            Set a username to get a public profile URL and share your lists.
          </div>
        )}

        {/* Identity card */}
        <section className="border border-gray-200 rounded p-5 flex flex-col gap-2">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-1">Account</h2>
          {profile?.email && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
          )}
          {profile?.created_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Joined</span>
              <span className="font-medium">{formatDate(profile.created_at)}</span>
            </div>
          )}
        </section>

        {/* Username form */}
        <section className="border border-gray-200 rounded p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">Username</h2>
          <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameSuccess(false);
                }}
                placeholder="e.g. gamer42"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <p className="text-xs text-gray-400">
                3–30 characters. Letters, numbers, _ and - only. Must start with a letter.
              </p>
            </div>
            {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
            {usernameSuccess && <p className="text-green-600 text-sm">Username saved.</p>}
            <button
              type="submit"
              disabled={isSavingUsername || !username.trim()}
              className="self-start border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingUsername ? "Saving…" : "Save username"}
            </button>
          </form>
        </section>

        {/* Password form */}
        <section className="border border-gray-200 rounded p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">Password</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm">Password changed.</p>}
            <button
              type="submit"
              disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="self-start border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPassword ? "Saving…" : "Change password"}
            </button>
          </form>
        </section>

        {/* Connected providers */}
        <section className="border border-gray-200 rounded p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">Connected accounts</h2>
          <div className="flex flex-col gap-2">
            {PROVIDERS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span>{label}</span>
                {profile?.[key] ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    Connected
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                    Not connected
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sign out */}
        <div className="pb-8">
          <button
            onClick={logout}
            className="border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </PageShell>
  );
}
