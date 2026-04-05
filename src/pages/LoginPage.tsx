import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID ?? "";
const REDIRECT_BASE = import.meta.env.VITE_REDIRECT_BASE_URL ?? "";

const CALLBACK_URI = `${REDIRECT_BASE}/auth/callback`;

function buildGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: CALLBACK_URI,
    response_type: "code",
    scope: "openid email",
    access_type: "offline",
    state: "google",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function buildDiscordAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: CALLBACK_URI,
    response_type: "code",
    scope: "identify email",
    state: "discord",
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show errors from the form or redirected back from OAuthCallbackPage
  const callbackError = searchParams.get("error");
  const [formError, setFormError] = useState<string | null>(null);
  const error = formError ?? callbackError;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignIn() {
    window.location.href = buildGoogleAuthUrl();
  }

  function handleDiscordSignIn() {
    window.location.href = buildDiscordAuthUrl();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm border border-gray-200 rounded p-8 bg-white">
        <h1 className="text-xl font-bold mb-6">Sign in</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!GOOGLE_CLIENT_ID}
            className="w-full border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={handleDiscordSignIn}
            disabled={!DISCORD_CLIENT_ID}
            className="w-full border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Sign in with Discord
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          No account?{" "}
          <Link to="/register" className="text-gray-900 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
