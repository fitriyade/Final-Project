"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(email, password);
      router.push("/");
    } catch (error) {
      alert("Login failed. Check your password and email.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden border border-blue-100/50">
        {/* IMAGE SECTION  */}
        <div className="relative flex flex-col items-center justify-center bg-linear-to-br from-blue-200 to-indigo-200 p-8 md:p-12 order-2 md:order-2 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-blue-800/70">We missed you</p>
          </div>

          <div className="relative z-10 w-full max-w-sm">
            <Image
              src="/image/login.png"
              alt="Login Illustration"
              width={300}
              height={300}
              className="w-full h-auto drop-shadow-xl"
              priority
            />
          </div>

          {/* Features list */}
          <div className="relative z-10 mt-8 space-y-3 w-full max-w-sm">
            <div className="flex items-center gap-3 text-blue-900/80">
              <LogIn className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Access your account</span>
            </div>
            <div className="flex items-center gap-3 text-blue-900/80">
              <Lock className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Secure login</span>
            </div>
            <div className="flex items-center gap-3 text-blue-900/80">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Connect with community</span>
            </div>
          </div>
        </div>

        {/* FORM SECTION  */}
        <div className="flex items-center justify-center p-8 md:p-12 order-1 md:order-1">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-900">Interestia</h1>
              <p className="text-blue-600/70 mt-2">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-700 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="hello@interestia.com"
                    className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition placeholder:text-blue-300 text-blue-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-700 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition placeholder:text-blue-300 text-blue-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white/90 text-blue-500">
                  New to Interestia?
                </span>
              </div>
            </div>

            <p className="text-center">
              <Link
                href="/register"
                className="text-blue-500 font-medium hover:text-blue-600 transition-colors hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
