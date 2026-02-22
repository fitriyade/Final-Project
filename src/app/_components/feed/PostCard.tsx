"use client";

import Image from "next/image";
import { Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import Modal from "@/app/_components/ui/modal";
import PostActions from "@/app/_components/action/PostAction"; // panggil PostActions

interface PostCardProps {
  post: any;
  onDelete?: (id: number) => void;
  onEdit?: (post: any) => void;
}

export default function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-5 relative overflow-visible">
        {/* DELETE BUTTON */}
        {onDelete && post.id && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this post?")) {
                onDelete(post.id);
              }
            }}
            className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition z-10"
          >
            <Trash2 size={18} />
          </button>
        )}

        {/* EDIT BUTTON */}
        {onEdit && (
          <button
            onClick={() => onEdit(post)}
            className="absolute top-4 right-10 text-indigo-500 hover:text-indigo-700 transition z-10"
          >
            <Edit2 size={18} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src={post.profilePicture || "/image/avatar.png"}
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div>
            <p className="font-semibold text-slate-800">
              {post.name || "Unknown User"}
            </p>
            <p className="text-xs text-slate-500">
              {post.createdAt
                ? new Date(post.createdAt).toLocaleString()
                : "Just now"}
            </p>
          </div>
        </div>

        {/* Content */}
        {post.text && <p className="text-slate-700 mb-4">{post.text}</p>}

        {/* Image */}
        {post.image && (
          <div
            className="w-full h-60 mb-4 relative cursor-pointer"
            onClick={() => setShowImageModal(true)}
          >
            <Image
              src={post.image}
              alt="Post"
              fill
              className="w-full h-full object-cover rounded-xl hover:opacity-90 transition"
            />
          </div>
        )}

        {/* Actions */}
        <PostActions postId={post.id} />
      </div>

      {/* IMAGE MODAL */}
      {post.image && (
        <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)}>
          <img
            src={post.image}
            alt="Expanded post image"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
          />
        </Modal>
      )}
    </>
  );
}
