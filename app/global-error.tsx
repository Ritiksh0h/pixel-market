"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "monospace", background: "#0a0e1a", color: "#e2e8f0", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <p style={{ fontSize: "48px", marginBottom: "8px" }}>500</p>
            <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Something went wrong</h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px", lineHeight: 1.6 }}>
              An unexpected error occurred. This has been logged and we&apos;ll look into it.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                background: "#e2e8f0",
                color: "#0a0e1a",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
