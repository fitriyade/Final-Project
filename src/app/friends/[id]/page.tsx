"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Heart, User as UserIcon } from "lucide-react";
import { Post } from "@/types/post";

export default function ProfilePageFriend() {
  const params = useParams();
  const friendId = typeof params?.id === "string" ? params.id : undefined;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPosts = async () => {
    try {
      if (!friendId) return;
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }

      const res = await fetch(
        `https://photo-sharing-api-bootcamp.do.dibimbing.id/api/v1/users-post/${friendId}?size=100&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey: "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b",
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();

      setPosts(data?.data?.posts || []);
      setTotalPosts(data?.data?.totalItems || data?.data?.posts?.length || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFollowersCount = async () => {
    try {
      if (!friendId) return;
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://photo-sharing-api-bootcamp.do.dibimbing.id/api/v1/followers/${friendId}?size=1&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey: "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b",
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setFollowersCount(data?.data?.totalItems || data?.totalItems || 0);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const getFollowingCount = async () => {
    try {
      if (!friendId) return;

      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://photo-sharing-api-bootcamp.do.dibimbing.id/api/v1/followings/${friendId}?size=1&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey: "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b",
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setFollowingCount(data?.data?.totalItems || data?.totalItems || 0);
      }
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  useEffect(() => {
    if (friendId) {
      getPosts();
      getFollowersCount();
      getFollowingCount();
    }
  }, [friendId]);

  if (!friendId) {
    return <p className="text-center mt-10">Invalid user</p>;
  }

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  const user = posts.length > 0 ? posts[0].user : null;

  return (
    <main className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* PROFILE HEADER - SAME STYLE AS PROFILE PAGE */}
        {user && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* AVATAR SECTION */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-4 border-white shadow-md">
                    {!imageError && user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt="Profile"
                        width={128}
                        height={128}
                        onError={() => setImageError(true)}
                        className="rounded-full object-cover w-full h-full"
                      />
                    ) : (
                      <UserIcon className="w-14 h-14 md:w-16 md:h-16 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* USER INFO SECTION */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                      {user.username}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{user.name}</p>
                  </div>
                </div>

                {/* BIO */}
                {user.bio && (
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* STATS  */}
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {totalPosts}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">posts</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      {followersCount}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      followers
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      {followingCount}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      following
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POSTS GRID  */}
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={post.imageUrl || "/image/post.jpg"}
                    alt={post.caption || "Post image"}
                    className="w-full h-full object-cover hover:scale-105 transition"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/image/post.jpg";
                    }}
                  />
                </div>

                <div className="p-3">
                  <p className="flex items-center gap-1 text-sm font-semibold">
                    <Heart fill="red" strokeWidth={0} size={16} />
                    {post.totalLikes || 0}
                  </p>

                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {post.caption || "No caption"}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
