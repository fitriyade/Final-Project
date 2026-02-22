"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [imageSrc, setImageSrc] = useState("/image/avatar.png");
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);

      if (
        parsedUser.profilePictureUrl &&
        parsedUser.profilePictureUrl.trim() !== ""
      ) {
        setImageSrc(parsedUser.profilePictureUrl);
      }

      //  Ambil semua posts
      const storedPosts = localStorage.getItem("posts");
      if (storedPosts) {
        const allPosts = JSON.parse(storedPosts);

        //  Filter hanya post milik user ini
        const filteredPosts = allPosts.filter(
          (post: any) => post.userId === parsedUser.id,
        );

        setUserPosts(filteredPosts);
      }
    }
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-white px-4 md:px-20 py-10">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b pb-10">
        {/* Avatar */}
        <div className="relative w-36 h-36 shrink-0">
          <Image
            src={imageSrc}
            alt="Profile"
            fill
            onError={() => setImageSrc("/image/avatar.png")}
            className="rounded-full object-cover border-4 border-slate-200"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-2xl font-semibold">{user.username}</h2>

            <Link
              href="/profile/edit"
              className="px-4 py-1.5 border rounded-lg text-sm font-medium hover:bg-slate-100 transition inline-block"
            >
              Edit Profile
            </Link>
          </div>

          <div className="mt-6 space-y-2">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-slate-600">
              {user.bio || "No bio yet."}
            </p>

            {user.website && (
              <a
                href={user.website}
                target="_blank"
                className="text-sm text-indigo-600 font-medium"
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* REAL POSTS GRID */}
      <div className="grid grid-cols-3 gap-3 mt-8">
        {userPosts.length === 0 ? (
          <p className="col-span-3 text-center text-slate-400">No posts yet.</p>
        ) : (
          userPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square bg-slate-100 rounded-lg overflow-hidden"
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 p-2 text-center">
                  {post.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
