"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

interface Props {
  user: User;
}

export default function EditProfileForm({ user }: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState<User>(user);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(
    user.profilePictureUrl || "/image/avatar.png",
  );

  // HANDLE TEXT INPUT
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //  HANDLE IMAGE UPLOAD
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      setPreviewImage(base64);

      setFormData({
        ...formData,
        profilePictureUrl: base64,
      });
    };

    reader.readAsDataURL(file);
  };

  //  HANDLE SAVE
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify(formData));
      router.push("/profile");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PROFILE PHOTO */}
      <div className="flex flex-col items-center gap-4">
        {/* Wrapper supaya selalu kotak */}
        <div className="w-36 h-36 relative">
          <img
            src={previewImage}
            alt="Profile Preview"
            className="w-full h-full rounded-full object-cover border-4 border-slate-200"
          />
        </div>

        <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
          Change Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/*  NAME  */}
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full mt-1 p-3 border rounded-lg"
        />
      </div>

      {/*  USERNAME  */}
      <div>
        <label className="text-sm font-medium">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full mt-1 p-3 border rounded-lg"
        />
      </div>

      {/*BIO  */}
      <div>
        <label className="text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ""}
          onChange={handleChange}
          rows={3}
          className="w-full mt-1 p-3 border rounded-lg"
        />
      </div>

      {/*  WEBSITE */}
      <div>
        <label className="text-sm font-medium">Website</label>
        <input
          type="text"
          name="website"
          value={formData.website || ""}
          onChange={handleChange}
          className="w-full mt-1 p-3 border rounded-lg"
        />
      </div>

      {/*  SAVE BUTTON */}
      <button
        type="submit"
        disabled={saving}
        className={`w-full py-3 rounded-lg font-medium transition ${
          saving
            ? "bg-indigo-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        } text-white`}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
