import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AI Form Generator</title>
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
