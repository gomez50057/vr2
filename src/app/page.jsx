import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#080d12",
      }}
    >
      <Link
        href="/recorrido-vr"
        style={{
          border: "1px solid rgba(255,255,255,.18)",
          borderRadius: 8,
          color: "#f4f7fb",
          padding: "14px 18px",
          textDecoration: "none",
        }}
      >
        Abrir recorrido virtual
      </Link>
    </main>
  );
}
