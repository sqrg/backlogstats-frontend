import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiGoogleAuth, apiDiscordAuth } from "../api/auth";

const CALLBACK_URI = `${import.meta.env.VITE_REDIRECT_BASE_URL ?? ""}/auth/callback`;

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    // Strict Mode runs effects twice in dev — guard against double execution
    if (handled.current) return;
    handled.current = true;

    async function handleCallback() {
      // Provider is carried in `state` to keep redirect_uri query-param-free
      const provider = searchParams.get("state");
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      if (!code) {
        navigate("/login?error=missing_code", { replace: true });
        return;
      }

      try {
        if (provider === "google") {
          const tokens = await apiGoogleAuth(code, CALLBACK_URI);
          await loginWithTokens(tokens.access_token, tokens.refresh_token);
          navigate("/", { replace: true });
        } else if (provider === "discord") {
          const tokens = await apiDiscordAuth(code, CALLBACK_URI);
          await loginWithTokens(tokens.access_token, tokens.refresh_token);
          navigate("/", { replace: true });
        } else {
          navigate("/login?error=unknown_provider", { replace: true });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "sign_in_failed";
        navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true });
      }
    }

    handleCallback();
  }, [loginWithTokens, navigate, searchParams]);

  return <p className="p-8 text-gray-500">Completing sign-in…</p>;
}
