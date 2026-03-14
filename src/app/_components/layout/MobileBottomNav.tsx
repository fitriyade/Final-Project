import { House, LayoutGrid, LogOut, User } from "lucide-react";
import Link from "next/link";

const MobileBottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-3 md:hidden z-50">
      <Link href="/">
        <House className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      </Link>

      <Link href="/friends">
        <LayoutGrid className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      </Link>

      <Link href="/profile">
        <User className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      </Link>

      <Link href="/login">
        <LogOut className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      </Link>
    </div>
  );
};

export default MobileBottomNav;
