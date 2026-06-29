import "./globals.css";

export const metadata = {
  title: "Recorrido virtual urbano",
  description: "Primera fase funcional de recorrido virtual 360 por nodos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
