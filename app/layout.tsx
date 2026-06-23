import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";



export const metadata: Metadata = {
  title: "Eprocurement",
  description: "lptrade.co",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-vh-100 d-flex flex-column">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
