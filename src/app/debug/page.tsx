"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function debug() {
      const { data: session } = await supabase.auth.getSession();
      setAuth(session);

      const { data: settings, error: settingsError } = await supabase
        .from("site_settings")
        .select("*");
      
      setData(settings);
      setError(settingsError);
    }
    debug();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1>Debug Site Settings</h1>
      <section>
        <h2>Auth Session</h2>
        <pre>{JSON.stringify(auth, null, 2)}</pre>
      </section>
      <section>
        <h2>Settings Data</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </section>
      <section>
        <h2>Errors</h2>
        <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {error ? JSON.stringify(error, null, 2) : "No errors reported."}
        </pre>
        {error && (
            <div style={{ marginTop: "20px", padding: "16px", background: "#FEE2E2", border: "1px solid #EF4444", borderRadius: "8px" }}>
                <strong>Diagnostics:</strong>
                <ul style={{ marginTop: "8px" }}>
                    {error.code === "PGRST116" && <li>PGRST116: No rows found or multiple rows returned for .single().</li>}
                    {error.code === "42P01" && <li>42P01: Table 'site_settings' does not exist.</li>}
                    {error.message?.includes("Permission denied") && <li>Permission Denied: RLS is blocking this request.</li>}
                </ul>
            </div>
        )}
      </section>
    </div>
  );
}
