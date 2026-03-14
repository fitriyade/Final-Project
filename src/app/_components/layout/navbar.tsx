"use client";

import { House, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="fflex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-blue-100 sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-6">
        <h1
          onClick={() => router.push("/")}
          className="text-lg md:text-xl font-bold text-indigo-600 cursor-pointer"
        >
          Interestia
        </h1>

        <div className="hidden md:flex items-center gap-4 text-slate-600">
          <House
            onClick={() => router.push("/")}
            className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition active:scale-90"
          />
          <LayoutGrid
            onClick={() => router.push("/friends")}
            className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition active:scale-90"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
