import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/_components/layout/navbar";
import MobileBottomNav from "@/app/_components/layout/MobileBottomNav";
import { FriendsProvider } from "@/app/context/FriendContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Interestia",
  description: "Social Media App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`m-0 p-0 ${poppins.className}`}>
        <FriendsProvider>
          <Navbar />
          <main className="pt-3">{children}</main>
          <MobileBottomNav />
        </FriendsProvider>
      </body>
    </html>
  );
}
