"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Users, LogOut, UserRound } from "lucide-react";
import CreatePost from "@/app/_components/feed/createPost";
import PostCard from "@/app/_components/feed/PostCard";
import { User } from "@/types/user";
import { ExploreUser, useFriends } from "@/app/context/FriendContext";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  //  RIGHT PANEL STATE
  const [exploreUsers, setExploreUsers] = useState<ExploreUser[]>([]);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [exploreSearchQuery, setExploreSearchQuery] = useState("");
  const { friends, addFriend } = useFriends();

  // HANDLER FOLLOW & DISMISS
  const handleFollow = (user: ExploreUser) => {
    addFriend(user);

    // hapus dari exploreUsers supaya tidak tampil lagi
    setExploreUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleDismiss = (userId: string) => {
    setExploreUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // LOAD POSTS
  useEffect(() => {
    const storedPosts = localStorage.getItem("posts");
    if (storedPosts) setPosts(JSON.parse(storedPosts));
  }, []);

  // AUTH + LOAD USER
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));
  }, [router]);

  // FETCH EXPLORE USERS
  useEffect(() => {
    const fetchExploreUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setExploreError("No token found");
          return;
        }

        const res = await fetch("/api/explore-post?size=100&page=1", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status}: ${text}`);
        }

        const data = await res.json();
        const postsData = data?.data?.posts || data?.data || [];

        if (!Array.isArray(postsData)) {
          throw new Error("Invalid response structure");
        }

        const mappedUsers: ExploreUser[] = postsData.map((post: any) => ({
          id: post.user?.id,
          username: post.user?.username,
          bio: post.user?.bio,
          profilePictureUrl: post.user?.profilePictureUrl,
        }));

        // Remove duplicates
        const uniqueUsers: ExploreUser[] = Array.from(
          new Map(mappedUsers.map((u) => [u.id, u])).values(),
        );

        setExploreUsers(uniqueUsers);
      } catch (err: any) {
        setExploreError(err.message);
      }
    };

    fetchExploreUsers();
  }, []);

  //  ADD / UPDATE / DELETE / EDIT POST
  const handleAddPost = (newPost: any) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
  };

  const handleUpdatePost = (updatedPost: any) => {
    const updatedPosts = posts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p,
    );
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    setEditingPost(null);
  };

  const handleDeletePost = (id: number) => {
    const updatedPosts = posts.filter((p) => p.id !== id);
    setPosts(updatedPosts);
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    if (editingPost?.id === id) setEditingPost(null);
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => setEditingPost(null);

  //  LOGOUT
  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  // FILTERED EXPLORE USERS
  const filteredExploreUsers = exploreUsers.filter((u) => {
    if (!u.username) return false;
    const alreadyFollowed = friends.some((f) => f.id === u.id);
    return (
      u.username.toLowerCase().includes(exploreSearchQuery.toLowerCase()) &&
      !alreadyFollowed
    );
  });

  return (
    <main className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] min-h-screen bg-slate-50">
      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex flex-col items-center p-6 gap-6">
        {/* Profile Card */}
        <div className="w-full max-w-xs bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 shrink-0">
              <Image
                src={user.profilePictureUrl || "/image/avatar.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover border-4 border-indigo-100"
              />
            </div>
          </div>
          <h1 className="text-lg font-semibold text-slate-800">{user.name}</h1>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <p className="text-sm text-slate-600 mt-3">
            {user.bio || "Content Creator"}
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            View Profile
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="w-full max-w-xs bg-white rounded-2xl shadow-md p-4">
          <div
            onClick={() => router.push("/friends")}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
          >
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-slate-700 font-medium">Friends</span>
          </div>
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-red-50 transition mt-2"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-medium">Logout</span>
          </div>
        </div>
      </div>

      {/* CENTER FEED */}
      <div className="p-4 md:p-6 space-y-6">
        <CreatePost
          user={user}
          onAddPost={handleAddPost}
          editingPost={editingPost}
          onUpdatePost={handleUpdatePost}
          onCancel={handleCancelEdit}
        />

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-6 text-center text-slate-500">
              No posts yet. Start sharing something.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden md:flex flex-col p-6 gap-4 max-w-xs">
        <h2 className="text-lg font-semibold text-slate-700">Explore Users</h2>

        {/* Search Input */}
        <div className="flex items-center w-full border border-slate-300 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full outline-none text-sm"
            value={exploreSearchQuery}
            onChange={(e) => setExploreSearchQuery(e.target.value)}
          />
        </div>

        {/* Error / No Users */}
        {exploreError && (
          <div className="text-red-500 text-sm mt-2">{exploreError}</div>
        )}

        {!exploreError && filteredExploreUsers.length === 0 && (
          <div className="text-slate-500 text-sm mt-2">No users found.</div>
        )}

        {/* Users List */}
        {!exploreError && filteredExploreUsers.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {filteredExploreUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg shadow hover:bg-slate-50 transition"
              >
                {/* Avatar + User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={`${user.username} avatar`}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-white font-semibold shrink-0">
                      {user.username?.charAt(0).toUpperCase() || (
                        <UserRound className="w-6 h-6 text-white" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">
                      {user.username}
                    </span>
                    {user.bio && (
                      <span className="text-sm text-slate-500 truncate">
                        {user.bio}
                      </span>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => handleFollow(user)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
                  >
                    Follow
                  </button>
                  <button
                    onClick={() => handleDismiss(user.id)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
