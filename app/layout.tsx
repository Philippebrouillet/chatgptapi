import "./globals.css";
import { AppProviders } from "./providers";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <AppProviders>
        <body className="bg-gray-900 text-white h-full">{children}</body>
      </AppProviders>
    </html>
  );
}
