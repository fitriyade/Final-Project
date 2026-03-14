"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

export interface PostActionsProps {
  postId: string | number;
}

type Comment = {
  id: string;
  text: string;
  createdAt: string;
};

const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

export default function PostActions({ postId }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // GET LIKE STATUS & COUNT

  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        setLoadingInitial(true);
        const res = await fetch(`${BASE_URL}/api/v1/post/${postId}`, {
          headers: {
            apiKey: API_KEY,
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setLikeCount(data.data.likesCount || 0);
            if (data.data.isLiked !== undefined) {
              setLiked(data.data.isLiked);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch like data", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchLikeData();
  }, [postId, token]);

  // HANDLE LIKE / UNLIKE

  const handleLikeUnlike = async () => {
    if (loadingLike || loadingInitial || !token) {
      if (!token) alert("Please login to like posts");
      return;
    }

    setLoadingLike(true);
    const previousLiked = liked;
    setLiked(!liked);
    setLikeCount((prev) => (!liked ? prev + 1 : prev - 1));

    try {
      const endpoint = !previousLiked ? "like" : "unlike";
      const res = await fetch(`${BASE_URL}/api/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: String(postId) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `${endpoint} operation failed`);
      }

      if (data.data?.likeCount !== undefined) setLikeCount(data.data.likeCount);
      if (data.data?.isLiked !== undefined) setLiked(data.data.isLiked);
    } catch (error) {
      // rollback UI state jika gagal
      setLiked(previousLiked);
      setLikeCount((prev) => (previousLiked ? prev : prev - 1));
      console.error(`${liked ? "Unlike" : "Like"} failed`, error);
      alert(`Failed to ${liked ? "unlike" : "like"} post. Please try again.`);
    } finally {
      setLoadingLike(false);
    }
  };

  // GET COMMENTS

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/comments?postId=${postId}`,
          { headers: { apiKey: API_KEY } },
        );
        if (!res.ok) return;

        const data = await res.json();
        const formatted = (data?.data || [])
          .filter((c: any) => c != null)
          .map((c: any) => ({
            id: String(c.id),
            text: c.comment || "",
            createdAt: c.createdAt || new Date().toISOString(),
          }));

        setComments(formatted);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };

    fetchComments();
  }, [postId]);

  // ADD COMMENT

  const addComment = async () => {
    if (!commentInput.trim() || !postId || !token) {
      if (!token) alert("Please login to comment");
      return;
    }

    const tempId = "temp-" + Date.now();
    const tempComment: Comment = {
      id: tempId,
      text: commentInput,
      createdAt: new Date().toISOString(),
    };

    setComments((prev = []) => [...prev.filter(Boolean), tempComment]);
    setCommentInput("");

    try {
      const res = await fetch(`${BASE_URL}/api/v1/create-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, comment: tempComment.text }),
      });

      if (!res.ok) throw new Error(`Create comment failed: ${res.status}`);

      const data = await res.json();

      setComments((prev = []) =>
        prev
          .filter(Boolean)
          .map((c) =>
            c && c.id === tempId
              ? {
                  ...c,
                  id: String(data.data?.id || c.id),
                  createdAt: data.data?.createdAt || c.createdAt,
                }
              : c,
          )
          .filter(Boolean),
      );
    } catch (error) {
      console.error(error);
      setComments((prev = []) => prev.filter((c) => c && c.id !== tempId));
      alert("Failed to add comment. Please try again.");
    }
  };

  // DELETE COMMENT

  const deleteComment = async (commentId: string | number) => {
    if (!commentId || !token) {
      if (!token) alert("Please login to delete comments");
      return;
    }

    const idStr = String(commentId);

    if (idStr.startsWith("temp-")) {
      setComments((prev = []) =>
        prev.filter((c) => c && String(c.id) !== idStr),
      );
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/delete-comment/${idStr}`, {
        method: "DELETE",
        headers: {
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed: ${res.status} - ${text}`);
      }

      setComments((prev = []) =>
        prev.filter((c) => c && String(c.id) !== idStr),
      );
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Actions*/}
      <div className="flex gap-4 text-sm">
        <button
          className={`flex items-center gap-1.5 transition-all ${
            liked ? "text-red-500" : "text-blue-400 hover:text-blue-500"
          } ${loadingLike || loadingInitial ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleLikeUnlike}
          disabled={loadingLike || loadingInitial}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
          {likeCount > 0 && <span className="font-medium">{likeCount}</span>}
        </button>

        <button
          className={`flex items-center gap-1.5 transition-all ${
            showCommentInput
              ? "text-blue-600"
              : "text-blue-400 hover:text-blue-500"
          }`}
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageCircle className="w-5 h-5" />
          {comments.length > 0 && (
            <span className="font-medium">{comments.length}</span>
          )}
        </button>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder={token ? "Write a comment..." : "Login to comment"}
            className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition bg-blue-50/50 placeholder:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
            disabled={!token}
          />
          <button
            className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addComment}
            disabled={!commentInput.trim() || !token}
          >
            Post
          </button>
        </div>
      )}

      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-3 mt-3 pt-3 border-t border-blue-100">
          {comments.filter(Boolean).map((comment) => (
            <div key={comment.id} className="flex items-start gap-2 group">
              <div className="flex-1">
                <div className="bg-blue-100/50 rounded-xl px-3 py-2 w-full">
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
                <span className="text-xs text-blue-400 mt-1 block">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              {token && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-red-400 hover:text-red-500 p-1.5 rounded-lg"
                >
                  <Trash2 className="w-5 h-5 mt-1" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
