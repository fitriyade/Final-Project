"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginUser(email, password);
      router.push("/");
    } catch (error) {
      alert("Login gagal. Cek email atau password.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        {/* IMAGE SECTION */}
        <div className="flex flex-col items-center justify-center bg-indigo-50 p-6 md:p-10">
          <Image
            src="/image/login.png"
            alt="Login Illustration"
            width={200}
            height={200}
            className="w-32 md:w-60 h-auto"
            priority
          />
        </div>

        {/* FORM SECTION */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-slate-800 text-center">
              Interestia
            </h1>
            <p className="text-center text-slate-500 mt-2 mb-6">
              Sign in to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{" "}
              <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
