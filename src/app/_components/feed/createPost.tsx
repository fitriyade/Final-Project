"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CreatePostProps {
  user: {
    id?: string;
    name: string;
    username: string;
    profilePictureUrl?: string;
  };
  onAddPost: (post: any) => void;
  editingPost?: {
    id: number;
    text: string;
    image?: string | null;
  };
  onUpdatePost?: (post: any) => void;
  onDeletePost?: (id: number) => void;
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

  useEffect(() => {
    if (editingPost) {
      setPostText(editingPost.text || "");
      setPostImage(editingPost.image || null);
    } else {
      setPostText("");
      setPostImage(null);
    }
  }, [editingPost]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleShareOrUpdate = () => {
    if (!postText && !postImage) return;

    if (editingPost && onUpdatePost) {
      const updatedPost = {
        ...editingPost,
        text: postText,
        image: postImage,
        updatedAt: new Date().toISOString(),
      };
      onUpdatePost(updatedPost);
    } else {
      const newPost = {
        id: Date.now(),
        text: postText,
        image: postImage,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePictureUrl,
        userId: user.id, //
        createdAt: new Date().toISOString(),
      };

      onAddPost(newPost);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (editingPost && onDeletePost) {
      if (confirm("Are you sure you want to delete this post?")) {
        onDeletePost(editingPost.id);
        resetForm();
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  const resetForm = () => {
    setPostText("");
    setPostImage(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 relative">
      {/* Top Input */}
      <div className="flex gap-3">
        <div className="relative w-12 h-12 shrink-0">
          <Image
            src={user.profilePictureUrl || "/image/avatar.png"}
            alt="Avatar"
            fill
            className="rounded-full object-cover"
          />
        </div>

        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Share your interest..."
          rows={3}
          className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-base md:text-lg outline-none resize-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Preview Image */}
      {postImage && (
        <div className="mt-4 w-full">
          <img
            src={postImage}
            alt="Preview"
            className="w-auto max-w-full rounded-xl"
          />
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-indigo-100 text-sm font-medium transition">
          📷 Image
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
            className="px-4 py-2 rounded-full bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>

          {editingPost && onDeletePost && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Delete
            </button>
          )}

          <button
            onClick={handleShareOrUpdate}
            className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            {editingPost ? "Update" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
