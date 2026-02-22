"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export interface PostActionsProps {
  postId: string | number;
}

export default function PostActions({ postId }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comments, setComments] = useState<
    { text: string; editing: boolean; createdAt: string }[]
  >([]);
  const [commentInput, setCommentInput] = useState("");

  //comment function
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments-${postId}`);
    if (savedComments) setComments(JSON.parse(savedComments));

    const savedLike = localStorage.getItem(`like-${postId}`);
    if (savedLike) {
      const parsed = JSON.parse(savedLike);
      setLiked(parsed.liked);
      setLikeCount(parsed.likeCount);
    }
  }, [postId]);

  const saveComments = (
    newComments: { text: string; editing: boolean; createdAt: string }[],
  ) => {
    setComments(newComments);
    localStorage.setItem(`comments-${postId}`, JSON.stringify(newComments));
  };

  // Like function
  const saveLike = (newLiked: boolean, newLikeCount: number) => {
    setLiked(newLiked);
    setLikeCount(newLikeCount);
    localStorage.setItem(
      `like-${postId}`,
      JSON.stringify({ liked: newLiked, likeCount: newLikeCount }),
    );
  };

  const toggleLike = () => {
    saveLike(!liked, liked ? likeCount - 1 : likeCount + 1);
  };

  const addComment = () => {
    if (commentInput.trim() !== "") {
      const newComment = {
        text: commentInput,
        editing: false,
        createdAt: new Date().toLocaleString(),
      };
      saveComments([...comments, newComment]);
      setCommentInput("");
    }
  };

  // delete comment
  const deleteComment = (index: number) => {
    const newComments = comments.filter((_, i) => i !== index);
    saveComments(newComments);
  };

  const toggleEditComment = (index: number) => {
    const newComments = [...comments];
    newComments[index].editing = !newComments[index].editing;
    saveComments(newComments);
  };

  const saveEditComment = (index: number, newText: string) => {
    const newComments = [...comments];
    newComments[index].text = newText;
    newComments[index].editing = false;
    saveComments(newComments);
  };

  return (
    <div className="space-y-2">
      {/* Actions */}
      <div className="flex gap-6 text-slate-500 text-sm mb-2">
        <button
          className={`flex items-center gap-1 transition ${
            liked ? "text-red-500" : "hover:text-indigo-600"
          }`}
          onClick={toggleLike}
        >
          <Heart />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <button
          className="hover:text-indigo-600 transition"
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          Comment
        </button>
        <button className="hover:text-indigo-600 transition">Share</button>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="flex gap-2 mb-2">
          <input
            id={`commentInput-${postId}`}
            type="text"
            placeholder="Write a comment..."
            className="flex-1 border rounded px-2 py-1 text-sm"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition"
            onClick={addComment}
          >
            Post
          </button>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-1">
        {comments.map((c, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {c.editing ? (
                <>
                  <input
                    type="text"
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    value={c.text}
                    onChange={(e) => {
                      const newComments = [...comments];
                      newComments[i].text = e.target.value;
                      setComments(newComments);
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && saveEditComment(i, c.text)
                    }
                  />
                  <button
                    className="text-green-600 hover:text-green-800 text-sm"
                    onClick={() => saveEditComment(i, c.text)}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-700">
                    {c.text}
                  </span>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                    onClick={() => toggleEditComment(i)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => deleteComment(i)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
            {/* Tanggal & Waktu */}
            {!c.editing && (
              <span className="text-xs text-slate-400">{c.createdAt}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
