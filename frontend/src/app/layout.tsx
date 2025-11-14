import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";

import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Search",
  description: "LLM Based Jwelery search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
