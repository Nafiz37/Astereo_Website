import { ImageResponse } from "next/og";

export const alt = "Astareo - Enterprise software, AI agents, LMS, ERP & CI/CD";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#0a0f1e 0%,#111a3a 60%,#2a1650 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#3b82f6,#a21caf)" }} />
          Astareo
        </div>
        <div style={{ marginTop: 40, fontSize: 76, fontWeight: 800, lineHeight: 1.05, display: "flex", flexWrap: "wrap" }}>Transform Your Business with Enterprise Software</div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#9fb2d4" }}>Custom Software · AI Agents · LMS · ERP · CI/CD</div>
      </div>
    ),
    size,
  );
}
