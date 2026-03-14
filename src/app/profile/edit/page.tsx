"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import EditProfileForm from "@/app/_components/profile/EditProfileForm";
import { ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-lg border border-blue-100/50">
          <p className="text-blue-500 animate-pulse font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Edit Profile Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-blue-100">
            <h1 className="text-2xl font-bold text-blue-900">Edit Profile</h1>
            <p className="text-sm text-blue-500 mt-1">
              Update your profile information below
            </p>
          </div>

          {/* Form Container */}
          <div className="p-6">
            <EditProfileForm user={user} />
          </div>
        </div>
      </div>
    </main>
  );
}
