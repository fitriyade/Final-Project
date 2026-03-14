"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Users, LogOut, User as UserIcon } from "lucide-react";
import CreatePost from "@/app/_components/feed/createPost";
import PostCard from "@/app/_components/feed/PostCard";
import { User } from "@/types/user";
import { ExploreUser, useFriends } from "@/app/context/FriendContext";

const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

type Post = {
  id: string;
  text: string;
  image?: string;
  name?: string;
  username?: string;
  profilePicture?: string;
  createdAt?: string;
  userId?: string;
};
type Story = {
  id: string;
  url: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  const [exploreUsers, setExploreUsers] = useState<ExploreUser[]>([]);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [exploreSearchQuery, setExploreSearchQuery] = useState("");

  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [followError, setFollowError] = useState<string | null>(null);

  const { friends, addFriend } = useFriends();

  const [stories, setStories] = useState<Story[]>([]);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  /* =========================
     AUTH */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));
  }, [router]);

  /* =========================
     FETCH ALL POSTS  */

  const fetchAllPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user?.id) return;

      // 1️ Mengambil post dari user yang di-follow
      const followingRes = await fetch(
        `${BASE_URL}/api/v1/following-post?size=100&page=1&_=${Date.now()}`,
        { headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` } },
      );
      const followingData = followingRes.ok ? await followingRes.json() : null;
      // Mapping data API menjadi format Post
      const followingPosts: Post[] = (followingData?.data?.posts || []).map(
        (post: any) => ({
          id: post.id,
          text: post.caption,
          image: post.imageUrl,
          username: post.user?.username || "unknown",
          profilePicture: post.user?.profilePictureUrl,
          createdAt: post.createdAt,
          userId: post.user?.id,
        }),
      );

      // 2 Mengambil post milik user sendiri
      const userRes = await fetch(
        `${BASE_URL}/api/v1/users-post/${user.id}?size=100&page=1&_=${Date.now()}`,
        { headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` } },
      );
      const userData = userRes.ok ? await userRes.json() : null;
      // Mapping data post user
      const userPosts: Post[] = (userData?.data?.posts || []).map(
        (post: any) => ({
          id: post.id,
          text: post.caption,
          image: post.imageUrl,
          username: user.username,
          profilePicture: user.profilePictureUrl,
          createdAt: post.createdAt,
          userId: user.id,
        }),
      );

      // 3️ Gabungkan post user dan following tanpa duplikat & urutkan terbaru
      const combinedPosts = [...userPosts, ...followingPosts].filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
      );
      // Mengurutkan post dari yang terbaru
      combinedPosts.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );

      setPosts(combinedPosts);
    } catch (err) {
      console.error("Fetch all posts error:", err);
    }
  };

  // Fetch posts saat user tersedia atau friends berubah
  useEffect(() => {
    if (user?.id) fetchAllPosts();
  }, [user?.id, JSON.stringify(friends)]);

  // Listener untuk follow/unfollow
  useEffect(() => {
    const handleFollowingChanged = () => fetchAllPosts();
    window.addEventListener("following-changed", handleFollowingChanged);
    return () =>
      window.removeEventListener("following-changed", handleFollowingChanged);
  }, []);

  /* =========================
     EXPLORE USERS*/
  // Mengambil daftar user dari explore post
  useEffect(() => {
    const fetchExploreUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${BASE_URL}/api/v1/explore-post?size=100&page=1`,
          {
            headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        const postsData = data?.data?.posts || [];

        // Mapping user dari setiap post
        const mappedUsers: ExploreUser[] = postsData.map((post: any) => ({
          id: post.user?.id,
          username: post.user?.username || "unknown",
          bio: post.user?.bio,
          profilePictureUrl: post.user?.profilePictureUrl,
        }));

        // Menghapus user yang duplikat
        const uniqueUsers = Array.from(
          new Map(mappedUsers.map((u) => [u.id, u])).values(),
        );

        setExploreUsers(uniqueUsers);
      } catch (err: any) {
        setExploreError(err.message);
      }
    };

    fetchExploreUsers();
  }, []);

  /* =========================
     ADD / DELETE / EDIT POST*/

  // Refresh feed setelah menambah post
  const handleAddPost = async () => {
    await fetchAllPosts();
  };
  // Handle Delete Post
  const handleDeletePost = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/api/v1/delete-post/${id}`, {
        method: "DELETE",
        headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` },
      });
      await handleAddPost(); // refresh feed
      // Jika post yang dihapus sedang diedit -> reset edit
      if (editingPost?.id === id) setEditingPost(null);
    } catch (err) {
      console.error(err);
    }
  };
  // Menandai post yang ingin diedit
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCancelEdit = () => setEditingPost(null);

  /* =========================
     FOLLOW */
  // Mengikuti user dari explore
  const handleFollow = async (user: ExploreUser) => {
    try {
      setFollowLoading(user.id);
      setFollowError(null);
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/v1/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIdFollow: user.id }),
      });

      if (!res.ok) throw new Error("Failed to follow user");
      // Tambahkan ke daftar friends
      addFriend(user);
      // Hapus dari explore list
      setExploreUsers((prev) => prev.filter((u) => u.id !== user.id));
      // Refresh feed
      await fetchAllPosts();
    } catch (err: any) {
      console.error(err);
      setFollowError(err.message);
      // Tetap tambahkan friend sebagai fallback
      addFriend(user);
      setExploreUsers((prev) => prev.filter((u) => u.id !== user.id));
      await fetchAllPosts();
    } finally {
      setFollowLoading(null);
    }
  };

  const handleDismiss = (userId: string) => {
    setExploreUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  /* =========================
     STORY */
  //Upload Story baru
  const handleUploadStory = async (file: File) => {
    try {
      setUploadingStory(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${BASE_URL}/api/v1/upload-image`, {
        method: "POST",
        headers: {
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      // Jika upload berhasil → simpan story
      if (data?.url) {
        const newStory = {
          id: Date.now().toString(),
          url: data.url,
        };

        const updatedStories: Story[] = [newStory, ...stories];
        // Simpan story di localStorage
        setStories(updatedStories);
        localStorage.setItem("stories", JSON.stringify(updatedStories));
      }
    } catch (err) {
      console.error("Story upload error:", err);
    } finally {
      setUploadingStory(false);
    }
  };
  // Mengambil story dari localStorage saat pertama load
  useEffect(() => {
    const savedStories = localStorage.getItem("stories");
    if (savedStories) {
      setStories(JSON.parse(savedStories));
    }
  }, []);

  // Handle Delete Story
  const handleDeleteStory = (id: string) => {
    const updatedStories = stories.filter((story) => story.id !== id);

    setStories(updatedStories);
    localStorage.setItem("stories", JSON.stringify(updatedStories));

    setActiveStory(null);
  };
  /* =========================
     LOGOUT */
  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };
  // Jika user belum ada → tidak render halaman
  if (!user) return null;

  /* =========================
     Filter user berdasarkan search (yang belum di follow*/
  const filteredExploreUsers = exploreUsers.filter((u) => {
    if (!u.username || !u.id) return false;
    const alreadyFollowed = friends.some((f) => f.id === u.id);
    return (
      u.username.toLowerCase().includes(exploreSearchQuery.toLowerCase()) &&
      !alreadyFollowed
    );
  });

  return (
    <main className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex flex-col items-center p-6 gap-6">
        <div className="w-full max-w-xs bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 shrink-0">
              {!profileImageError && user.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl || "/image/user.png"}
                  alt="Profile"
                  fill
                  onError={() => setProfileImageError(true)}
                  className="rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <UserIcon className="w-12 h-12 text-blue-400" />
                </div>
              )}
            </div>
          </div>

          <h1 className="text-lg font-semibold text-blue-900">{user.name}</h1>
          <p className="text-sm text-blue-500">@{user.username}</p>

          <button
            onClick={() => router.push("/profile")}
            className="mt-4 w-full bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-200/50"
          >
            View Profile
          </button>
        </div>

        <div className="w-full max-w-xs bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-4">
          <div
            onClick={() => router.push("/friends")}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50 transition text-blue-700"
          >
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Friends</span>
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-50 transition mt-2 text-red-500"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>
      {/* CENTER FEED */}
      <div className="p-4 md:p-6 space-y-6">
        {/* STORY SECTION */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {/* ADD STORY BUTTON */}
          <label className="flex flex-col items-center cursor-pointer">
            <div className="w-14 h-14 rounded-full border-2 border-blue-400 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition">
              +
            </div>
            <span className="text-xs text-blue-600 mt-1">
              {uploadingStory ? "Uploading..." : "Add"}
            </span>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadStory(file);
              }}
            />
          </label>

          {stories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setActiveStory(story)}
            >
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src={story.url}
                  alt="story"
                  fill
                  className="rounded-full object-cover border-2 border-pink-400"
                />
              </div>
            </div>
          ))}
        </div>
        <CreatePost
          user={user}
          onAddPost={handleAddPost}
          editingPost={editingPost}
          onDeletePost={handleDeletePost}
          onCancel={handleCancelEdit}
        />

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white/90 rounded-2xl p-6 text-center text-blue-500">
              {friends.length === 0
                ? "You're not following anyone yet. Follow some users to see their posts!"
                : "No posts from your friends yet."}
            </div>
          ) : (
            posts
              .filter((post) => post && post.id)
              .map((post) => (
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
      <div className="hidden md:flex flex-col p-6 gap-4 w-96">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-5">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Explore Users
          </h2>

          <div className="flex items-center w-full border border-blue-200 rounded-full px-4 py-2 bg-blue-50/50 mb-4">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full outline-none text-sm bg-transparent"
              value={exploreSearchQuery}
              onChange={(e) => setExploreSearchQuery(e.target.value)}
            />
          </div>

          {followError && (
            <div className="text-red-500 text-xs mb-2 p-2 bg-red-50 rounded">
              {followError}
            </div>
          )}

          {!exploreError && filteredExploreUsers.length === 0 && (
            <div className="text-blue-500 text-sm mt-2 text-center py-8">
              No users found.
            </div>
          )}

          {!exploreError && filteredExploreUsers.length > 0 && (
            <div className="flex flex-col gap-3 mt-2 max-h-125 overflow-y-auto">
              {filteredExploreUsers
                .filter((user) => user && user.id)
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-100/50 transition w-full"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                      <img
                        src={user.profilePictureUrl || "/image/user.png"}
                        alt={user.username || "User avatar"}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/image/user.png";
                        }}
                      />
                      <span className="text-sm text-slate-500 truncate font-medium">
                        {user.username || "Unknown User"}
                      </span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleFollow(user)}
                        disabled={followLoading === user.id}
                        className={`px-2 py-1 text-white rounded-lg text-[10px] font-medium transition ${
                          followLoading === user.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-400 hover:bg-blue-500"
                        }`}
                      >
                        {followLoading === user.id ? "..." : "Follow"}
                      </button>

                      <button
                        onClick={() => handleDismiss(user.id)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg text-[10px] font-medium transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      {activeStory && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="relative w-[90%] max-w-md h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeStory.url}
              alt="Story"
              fill
              className="object-contain rounded-xl"
            />

            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDeleteStory(activeStory.id)}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
