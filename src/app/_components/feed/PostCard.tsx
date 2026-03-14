"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/app/_components/ui/modal";
import PostActions from "@/app/_components/action/PostAction";

interface Post {
  id: string;
  text: string;
  image?: string;
  username?: string;
  profilePicture?: string;
  createdAt?: string;
  userId?: string;
}

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  onEdit?: (post: Post) => void;
}

export default function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [postImageError, setPostImageError] = useState(false);

  //  validasi URL
  const isValidUrl = (url: string | undefined) => {
    if (!url) return false;
    // Cek apakah URL valid (http, https, atau relative path)
    return (
      url.startsWith("http") || url.startsWith("https") || url.startsWith("/")
    );
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100/50 p-5 relative overflow-visible">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 shrink-0">
            {profileImageError || !isValidUrl(post.profilePicture) ? (
              <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                <span className="text-blue-500 font-medium text-lg">
                  {post.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            ) : (
              <Image
                src={post.profilePicture || "/image/user.png"}
                alt="Avatar"
                fill
                onError={() => setProfileImageError(true)}
                className="rounded-full object-cover border-2 border-blue-200"
              />
            )}
          </div>

          <div>
            <p className="font-semibold text-blue-900">
              {post.username || "Unknown"}
            </p>
            <p className="text-xs text-blue-500">
              {post.createdAt
                ? new Date(post.createdAt).toLocaleString()
                : "Just now"}
            </p>
          </div>
        </div>

        {/* Content */}
        {post.text && (
          <p className="text-blue-800/70 mb-4 leading-relaxed">{post.text}</p>
        )}

        {/* Image */}
        {post.image && (
          <div
            className="w-full h-60 mb-4 relative cursor-pointer group"
            onClick={() => setShowImageModal(true)}
          >
            {postImageError || !isValidUrl(post.image) ? (
              <img
                src="/image/post.jpg"
                alt="Default post"
                className="w-full h-full object-cover rounded-xl border border-blue-200"
              />
            ) : (
              <img
                src={post.image}
                alt="Post image"
                className="w-full h-full object-cover rounded-xl border border-blue-200"
                onError={() => setPostImageError(true)}
              />
            )}
          </div>
        )}

        {/* Actions  */}
        <div className="mt-4 pt-3 border-t border-blue-100">
          {post.id && <PostActions postId={post.id} />}
        </div>
      </div>

      {/* IMAGE MODAL */}
      {post.image &&
        showImageModal &&
        !postImageError &&
        isValidUrl(post.image) && (
          <Modal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
          >
            <div className="relative">
              <img
                src={post.image}
                alt="Expanded post image"
                className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl border-4 border-white"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </Modal>
        )}
    </>
  );
}
