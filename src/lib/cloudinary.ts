export const CLOUD_NAME = "dcri0cv7x";
export const UPLOAD_PRESET = "post_images";

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url as string;
}
