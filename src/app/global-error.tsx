"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, padding: 16, fontFamily: "monospace", background: "#fff1f1" }}>
        <h2 style={{ color: "#c00" }}>Global error caught</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#900" }}>
          {error.message}
          {"\n\n"}
          {error.stack}
        </pre>
        {error.digest && <p style={{ color: "#666" }}>digest: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", background: "#c00", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Retry
        </button>
      </body>
    </html>
  );
}
