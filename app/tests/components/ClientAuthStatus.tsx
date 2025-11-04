"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

type Props = {
  url: string;
  anonKey: string;
};

export default function ClientAuthStatus({ url, anonKey }: Props) {
  const supabase = useMemo(() => createClient(url, anonKey), [url, anonKey]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Fetch initial user
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setStatus(`Auth check failed: ${error.message}`);
        }
        setUserEmail(data?.user?.email ?? null);
      });

    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    setLoading(true);
    setStatus("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus(`Sign-out failed: ${error.message}`);
      } else {
        setStatus("Signed out");
      }
    } catch (err: any) {
      setStatus(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <div>
        <strong>Status:</strong> {userEmail ? `Signed in as ${userEmail}` : "Signed out"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="lk-button" onClick={handleSignOut} disabled={loading || !userEmail}>
          {loading ? "Signing out…" : "Sign out"}
        </button>
      </div>
      {status && (
        <div style={{ color: status.includes("Signed out") ? "green" : "crimson" }}>{status}</div>
      )}
    </div>
  );
}