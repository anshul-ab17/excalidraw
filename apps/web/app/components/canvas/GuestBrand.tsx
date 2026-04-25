export default function GuestBrand() {
  return (
    <div style={{ position: "fixed", top: 16, left: 16, zIndex: 10 }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(0,0,0,0.05)", borderRadius: 12,
        padding: "8px 16px", display: "flex", alignItems: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}>
         <div style={{ fontSize: 16, fontWeight: 900, color: "#1e1e1e", letterSpacing: "-0.5px" }}>
            Canvax
         </div>
      </div>
    </div>
  );
}
