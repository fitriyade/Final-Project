"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Heart } from "lucide-react";

interface Post {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  totalLikes: number;
  isLike: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    profilePictureUrl: string;
  };
}

export default function ProfilePageFriend() {
  const params = useParams();
  const friendId = typeof params?.id === "string" ? params.id : undefined;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
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

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Friend Profile</h1>

      {/* USER INFO */}
      {posts.length > 0 && posts[0].user && (
        <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-lg shadow">
          {posts[0].user.profilePictureUrl ? (
            <Image
              src={posts[0].user.profilePictureUrl}
              alt={posts[0].user.username}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl font-semibold text-indigo-600">
                {posts[0].user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{posts[0].user.username}</h2>
            <p className="text-gray-500">{posts[0].user.email}</p>
          </div>
        </div>
      )}

      {/* POSTS GRID */}
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={post.caption || "Post image"}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white">
                <div className="text-center px-4">
                  <p className="text-lg font-semibold">
                    <Heart fill="red" strokeWidth={0} /> {post.totalLikes || 0}
                  </p>
                  <p className="text-sm mt-2">{post.caption || "No caption"}</p>
                  <p className="text-xs mt-1">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "Unknown date"}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 w-full bg-black/50 text-white p-2 text-sm">
                <Heart fill="red" strokeWidth={0} /> {post.totalLikes || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
