export const metadata = {
  title: 'Ibiza Housing Mission',
  description: 'MCP público para descubrir y evaluar vivienda habitual en Ibiza'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f5f7fb', color: '#172033' }}>
        {children}
      </body>
    </html>
  );
}
