"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User as UserIcon, Edit, X } from "lucide-react";
import { User } from "@/types/user";
import PostActions from "@/app/_components/action/PostAction";
import Modal from "@/app/_components/ui/modal";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

export default function ProfilePage() {
  const router = useRouter();

  /* STATE */
  // Set data user, image avatar, posts, loading, dan jumlah following
  const [user, setUser] = useState<User | null>(null);
  const [imageSrc, setImageSrc] = useState("/image/user.png");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);

  /*EDIT POST STATE  */
  // Set data post yang sedang diedit, caption baru, file image baru, dan preview image
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  /* FETCH DATA */
  useEffect(() => {
    // Ambil token dan user dari localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // Redirect ke login jika tidak ada token
    if (!token) {
      router.push("/login");
      return;
    }

    // Set data user dan fetch posts + following
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);

      // Set avatar user, fallback ke default jika kosong
      setImageSrc(
        parsedUser.profilePictureUrl?.trim()
          ? parsedUser.profilePictureUrl
          : "/image/user.png",
      );

      // Fetch posts user dan jumlah following
      fetchUserPosts(token, parsedUser.id);
      fetchFollowingData(token);
    }
  }, [router]);

  // Ambil jumlah following user
  const fetchFollowingData = async (token: string) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/my-following?size=100&page=1`,
        {
          headers: {
            apiKey: API_KEY,
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        },
      );
      if (!res.ok) return console.error("Fetch following failed");
      const data = await res.json();
      setFollowingCount(data?.data?.totalItems || 0);
    } catch (err) {
      console.error("Error fetching following data:", err);
    }
  };

  // Ambil posts user
  const fetchUserPosts = async (token: string, userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/v1/users-post/${userId}?size=100&page=1`,
        {
          headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return console.error("Fetch user posts failed:", text);
      }
      const data = await res.json();
      const postsData = data?.data?.posts || [];

      // Simpan posts ke state userPosts
      setUserPosts(
        postsData.map((post: any) => ({
          id: post.id,
          text: post.caption,
          image: post.imageUrl,
          username: post.user?.username || user?.username || "Unknown",
          profilePicture:
            post.user?.profilePictureUrl || user?.profilePictureUrl || "",
          createdAt: post.createdAt,
          userId: post.user?.id || user?.id || "",
        })),
      );
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setLoading(false); // selesai loading
    }
  };

  /* EDIT POST HANDLERS */
  // Membuka modal edit post dan set state edit
  const handleEditPost = (post: any) => {
    setEditingPost({ ...post });
    setEditCaption(post.text || "");
    setEditPreview(post.image || null);
    setEditImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll ke atas
  };

  // Set preview image saat user memilih file baru
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setEditImageFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  // Reset edit state saat editingPost berubah
  useEffect(() => {
    if (editingPost) {
      setEditCaption(editingPost.text || "");
      setEditPreview(editingPost.image || null);
      setEditImageFile(null);
    }
  }, [editingPost]);

  // Simpan hasil edit post
  const handleSaveEdit = async () => {
    if (!editingPost) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    let finalImageUrl = editingPost.image;

    // Upload image baru ke Cloudinary
    if (editImageFile) {
      try {
        const uploadedUrl = await uploadImageToCloudinary(editImageFile);
        finalImageUrl = uploadedUrl + `?t=${Date.now()}`; //  timestamp untuk cache-busting
      } catch (err) {
        console.error("Upload failed:", err);
        return;
      }
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/v1/update-post/${editingPost.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiKey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            caption: editCaption || "",
            imageUrl: finalImageUrl,
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Update failed:", text);
        return;
      }

      const updatedPostJson = await res.json();
      const updatedPostData = updatedPostJson.data || updatedPostJson;

      // Update state userPosts dengan data baru
      setUserPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                text: editCaption,
                image: finalImageUrl,
                username: p.username || user?.username || "Unknown",
                profilePicture:
                  p.profilePicture || user?.profilePictureUrl || "",
              }
            : p,
        ),
      );

      // Reset modal & state edit
      setEditingPost(null);
      setEditCaption("");
      setEditImageFile(null);
      setEditPreview(null);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  /*  DELETE POST */
  // Hapus post user
  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/delete-post/${postId}`, {
        method: "DELETE",
        headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return console.error("Delete failed");
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Jika user belum ada, return null
  if (!user) return null;

  return (
    <main className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* PROFILE HEADER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* AVATAR - center on mobile */}
            <div className="flex flex-col items-center sm:items-start gap-4">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-linear-to-tr from-blue-50 to-indigo-50 flex items-center justify-center border-4 border-white shadow-md">
                  {!imageError && imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt="Profile"
                      width={128}
                      height={128}
                      onError={() => setImageError(true)}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300" />
                  )}
                </div>
              </div>
            </div>

            {/* USER INFO */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    {user.username}
                  </p>
                </div>

                <Link
                  href="/profile/edit"
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm w-full sm:w-auto"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  Edit Profile
                </Link>
              </div>

              {/* BIO */}
              {user.bio && (
                <div className="mb-4 text-center sm:text-left">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* STATS - horizontal scroll on very small devices */}
              <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-4">
                <div className="text-center">
                  <span className="font-semibold text-sm sm:text-base text-gray-900">
                    {userPosts.length}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm ml-1">
                    posts
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm sm:text-base text-gray-900">
                    0
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm ml-1">
                    followers
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm sm:text-base text-gray-900">
                    {followingCount}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm ml-1">
                    following
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POSTS SECTION */}
        <div className="mt-6 sm:mt-8">
          <div className="border-b border-gray-100 mb-4 sm:mb-6">
            <button className="px-1 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 border-b-2 border-gray-900">
              Posts
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <h3 className="text-gray-900 font-medium text-sm sm:text-base mb-1">
                No posts yet
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                When you share photos, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-50">
                    {post.image ? (
                      <img
                        src={post.image}
                        key={post.image}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 sm:p-6">
                        <p className="text-xs text-gray-400 text-center italic">
                          No image
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 sm:p-3">
                    {post.text && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {post.text}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <PostActions postId={post.id} />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*  EDIT MODAL */}
        <Modal
          isOpen={editingPost !== null}
          onClose={() => setEditingPost(null)}
        >
          <div className="flex flex-col gap-3 p-4 sm:p-0">
            <h2 className="text-base sm:text-lg font-semibold">Edit Post</h2>

            {/* Caption */}
            <textarea
              rows={3}
              className="w-full border rounded-lg p-2 sm:p-3 resize-none text-sm"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />

            {/* Change Image */}
            <div className="flex flex-col gap-2">
              {editPreview && (
                <div className="relative w-full h-40 sm:h-48">
                  <img
                    src={editPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditPreview(null);
                      setEditImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>
              )}

              <label className="cursor-pointer px-3 sm:px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveEdit}
              className="mt-2 w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Save
            </button>
          </div>
        </Modal>
      </div>
    </main>
  );
}
