const BASE_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apiKey: "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const error = contentType?.includes("application/json")
      ? await res.json()
      : await res.text();

    throw new Error(
      typeof error === "string"
        ? error
        : error.message || "Something went wrong",
    );
  }

  return res.json();
};
