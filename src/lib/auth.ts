import { apiFetch } from "@/lib/api";
import { LoginResponse } from "@/types/login";

export const loginUser = async (email: string, password: string) => {
  const data: LoginResponse = await apiFetch("/api/v1/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

export const registerUser = async (
  name: string,
  username: string,
  email: string,
  password: string,
) => {
  return await apiFetch("/api/v1/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      username,
      email,
      password,
      passwordRepeat: password,
    }),
  });
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
