"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { isSafeNextPath } from "../../lib/supabase/config";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) window.setTimeout(() => setError(code === "missing_code" ? "Google sign-in was cancelled or did not return an authorization code." : code === "callback_failed" ? "EduPilot could not finish Google sign-in. Please try again." : code === "auth_not_configured" ? "Authentication is not configured yet." : "Google sign-in could not be completed. Please try again."), 0);
  }, []);
  async function signInWithGoogle() {
    setLoading(true); setError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError("Authentication is not configured yet. Add the public Supabase variables to your local environment."); setLoading(false); return; }
    const next = new URLSearchParams(window.location.search).get("next");
    const redirectTo = `${window.location.origin}/auth/callback${isSafeNextPath(next) ? `?next=${encodeURIComponent(next!)}` : ""}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (authError) { setError("Google sign-in could not start. Check that the Google provider is enabled in Supabase."); setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-card"><div className="brand auth-brand"><div className="brand-mark">E</div><div><strong>EduPilot</strong><span>AI learning, adapted</span></div></div><div className="eyebrow">WELCOME BACK</div><h1>Your learning path, ready when you are.</h1><p>Sign in to keep your learner space separate and secure across sessions.</p><button className="google-button" onClick={signInWithGoogle} disabled={loading}><span className="google-icon">G</span>{loading ? "Connecting…" : "Continue with Google"}</button>{error && <div className="auth-error" role="alert">{error}</div>}<small className="auth-note">Your learning progress remains in this browser. Cross-device sync is not enabled yet.</small></section></main>;
}
