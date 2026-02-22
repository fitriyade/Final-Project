"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import EditProfileForm from "@/app/_components/profile/EditProfileForm";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-xl font-semibold mb-6">Edit Profile</h1>

        <EditProfileForm user={user} />
      </div>
    </main>
  );
}
