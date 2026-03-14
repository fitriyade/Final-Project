"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

type EditingPost = {
  id: string;
  text: string;
  image?: string | null;
};

interface CreatePostProps {
  user: {
    id?: string;
    username: string;
    profilePictureUrl?: string;
  };
  onAddPost: () => void;
  editingPost?: EditingPost | null;
  onUpdatePost?: (post: any) => void;
  onDeletePost?: (id: string) => void;
  onCancel?: () => void;
}

export default function CreatePost({
  user,
  onAddPost,
  editingPost,
  onUpdatePost,
  onDeletePost,
  onCancel,
}: CreatePostProps) {
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setPostText(editingPost.text || "");
      setPostImage(editingPost.image || null);
    } else {
      resetForm();
    }
  }, [editingPost]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  /* CREATE / UPDATE POST */
  const handleShareOrUpdate = async () => {
    if (!postText && !postImage) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      let imageUrl = editingPost?.image || null;

      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const endpoint = editingPost
        ? `${BASE_URL}/api/v1/update-post/${editingPost.id}`
        : `${BASE_URL}/api/v1/create-post`;

      const method = "POST";

      const bodyData: any = {
        imageUrl,
        caption: postText,
        status: "published",
      };

      if (user.id) bodyData.userId = user.id;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Post gagal:", data);
        return;
      }

      onAddPost();
      resetForm();
      onCancel?.();
    } catch (error) {
      console.error("Create / Update post error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* DELETE POST */
  const handleDelete = async () => {
    if (!editingPost) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/api/v1/delete-post/${editingPost.id}`,
        {
          method: "DELETE",
          headers: {
            apiKey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete gagal:", text);
        return;
      }

      onDeletePost?.(editingPost.id);
      onAddPost();
      resetForm();
      onCancel?.();
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const resetForm = () => {
    setPostText("");
    setPostImage(null);
    setImageFile(null);
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setImageFile(null);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-5 relative">
      <div className="flex gap-3">
        <div className="relative w-12 h-12 shrink-0">
          <Image
            src={
              !profileImageError && user?.profilePictureUrl
                ? user.profilePictureUrl
                : "/image/user.png"
            }
            alt="Avatar"
            fill
            onError={() => setProfileImageError(true)}
            className="rounded-full object-cover border-2 border-blue-200"
          />
        </div>

        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Share your interest..."
          rows={3}
          className="flex-1 bg-blue-50/50 border border-blue-200 rounded-2xl px-4 py-3 text-base md:text-lg outline-none resize-none"
        />
      </div>

      {postImage && (
        <div className="mt-4 w-full relative">
          <img
            src={postImage}
            alt="Preview"
            className="w-auto max-w-full rounded-xl border border-blue-200"
          />

          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-gray-200 hover:bg-gray-300 rounded-full"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-700 border border-blue-200">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          Add Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold"
          >
            Cancel
          </button>

          {editingPost && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-400 hover:bg-red-500 text-white font-semibold"
            >
              Delete
            </button>
          )}

          <button
            onClick={handleShareOrUpdate}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : editingPost ? "Update" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
