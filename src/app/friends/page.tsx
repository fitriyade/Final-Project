"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";

interface ExploreUser {
  id: string;
  username?: string;
  bio?: string;
  profilePictureUrl?: string;
}

const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

export default function FriendsPage() {
  const router = useRouter();

  const [friends, setFriends] = useState<ExploreUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUnfollow, setLoadingUnfollow] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Load friends
  useEffect(() => {
    const savedFriends = localStorage.getItem("friends");
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    }
  }, []);

  // Handle unfollow
  const handleUnfollow = async (userId: string) => {
    if (loadingUnfollow) return;

    if (!token) {
      console.error("Token tidak ditemukan");
      return;
    }

    const originalFriends = [...friends];

    // Optimistic update
    const updatedFriends = friends.filter((f) => f.id !== userId);
    setFriends(updatedFriends);
    localStorage.setItem("friends", JSON.stringify(updatedFriends));

    setLoadingUnfollow(userId);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/unfollow/${userId}`, {
        method: "DELETE",
        headers: {
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.text();

      if (!res.ok) {
        // Jika sudah unfollow, anggap sukses
        if (data.includes("already unfollow")) {
          console.log("User already unfollowed");
          // Dispatch custom event untuk memberi tahu halaman lain
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("following-changed", {
                detail: { action: "unfollow", userId },
              }),
            );
          }
        } else {
          console.error("❌ Unfollow failed:", data);

          // rollback
          setFriends(originalFriends);
          localStorage.setItem("friends", JSON.stringify(originalFriends));
        }
      } else {
        // *** PERBAIKAN: Unfollow sukses, beri notifikasi ***
        console.log("✅ Unfollow success");

        // Dispatch custom event untuk memberi tahu halaman lain
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("following-changed", {
              detail: { action: "unfollow", userId },
            }),
          );
        }
      }
    } catch (error) {
      console.error("❌ Unfollow error:", error);

      // rollback
      setFriends(originalFriends);
      localStorage.setItem("friends", JSON.stringify(originalFriends));
    } finally {
      setLoadingUnfollow(null);
    }
  };

  // Filter search
  const filteredFriends = friends.filter((friend) =>
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-blue-900">Friends</h1>
            <p className="text-sm text-blue-500 mt-1">
              {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />

          <input
            type="text"
            placeholder="Search friends..."
            className="w-full border border-blue-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition bg-white/90 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Friends List */}
        <div className="flex flex-col gap-3">
          {filteredFriends.length === 0 && (
            <div className="text-center text-blue-400 py-10">
              No friends found
            </div>
          )}

          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => router.push(`/friends/${friend.id}`)}
              className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow cursor-pointer hover:shadow-md transition"
            >
              {/* User Info */}
              <div className="flex items-center gap-3">
                <img
                  src={friend.profilePictureUrl || "/image/user.png"}
                  alt={friend?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/image/user.png";
                  }}
                />

                <span className="font-semibold text-blue-900">
                  {friend?.username || "Unknown User"}
                </span>
              </div>

              {/* Unfollow Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnfollow(friend.id);
                }}
                disabled={loadingUnfollow === friend.id}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition ${
                  loadingUnfollow === friend.id
                    ? "bg-gray-100 text-gray-400 border-gray-200"
                    : "bg-blue-50 text-blue-600 hover:bg-red-50 hover:text-red-500 border-blue-100"
                }`}
              >
                {loadingUnfollow === friend.id ? "Processing..." : "Unfollow"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
