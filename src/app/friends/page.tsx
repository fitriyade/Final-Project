"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserRound, Search } from "lucide-react";

interface ExploreUser {
  id: string;
  username?: string;
  bio?: string;
  profilePictureUrl?: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<ExploreUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("friends");
    if (saved) setFriends(JSON.parse(saved));
  }, []);

  const handleUnfollow = (userId: string) => {
    const updated = friends.filter((f) => f.id !== userId);
    setFriends(updated);
    localStorage.setItem("friends", JSON.stringify(updated));
  };

  const filteredFriends = friends.filter((f) =>
    f.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Friends</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search friends..."
            className="w-full border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Empty State */}
        {filteredFriends.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border">
            <p className="text-slate-500 text-sm">No friends found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => router.push(`/friends/${friend.id}`)}
                className="group flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {friend.profilePictureUrl ? (
                    <Image
                      src={friend.profilePictureUrl}
                      alt={`${friend.username} avatar`}
                      width={52}
                      height={52}
                      className="rounded-full object-cover shrink-0 ring-2 ring-slate-100"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold shrink-0 shadow">
                      {friend.username?.charAt(0).toUpperCase() || (
                        <UserRound className="w-6 h-6 text-white" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">
                      {friend.username || "Unknown User"}
                    </span>

                    {friend.bio && (
                      <span className="text-sm text-slate-500 truncate">
                        {friend.bio}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unfollow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfollow(friend.id);
                  }}
                  className="px-4 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-full hover:bg-red-100 hover:text-red-600 transition"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
