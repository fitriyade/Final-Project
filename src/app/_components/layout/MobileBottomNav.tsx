import { House, LayoutGrid, Sun, User } from "lucide-react";

const MobileBottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-3 md:hidden z-50">
      <House className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      <LayoutGrid className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      <Sun className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
      <User className="w-6 h-6 text-slate-600 hover:text-indigo-600 transition cursor-pointer" />
    </div>
  );
};

export default MobileBottomNav;
