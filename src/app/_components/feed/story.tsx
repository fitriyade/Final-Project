"use client";

import { useState } from "react";
import Image from "next/image";

const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

export default function Story() {
  const [file, setFile] = useState<File | null>(null);
  const [storyUrl, setStoryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const handleUploadStory = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${BASE_URL}/api/v1/upload-image`, {
        method: "POST",
        headers: {
          apiKey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        setStoryUrl(data.url);
      }
    } catch (err) {
      console.error("Upload gagal", err);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-3">Create Story</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3"
      />

      <button
        onClick={handleUploadStory}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        {loading ? "Uploading..." : "Upload Story"}
      </button>

      {storyUrl && (
        <div className="mt-4">
          <p className="text-sm mb-2">Story Preview:</p>
          <Image
            src={storyUrl}
            alt="story"
            width={200}
            height={200}
            className="rounded-lg object-cover"
          />
        </div>
      )}
    </div>
  );
}
