"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import Modal from "@/app/_components/ui/modal";
import Link from "next/link";
import { User, Mail, Lock, UserCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(name, username, email, password);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error(error);
      alert("Register gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectLogin = () => {
    setIsSuccessOpen(false);
    router.push("/login");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden border border-blue-100/50">
          {/* FORM SECTION */}
          <div className="flex items-center justify-center p-8 md:p-12 order-2 md:order-1">
            <div className="w-full max-w-sm space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-blue-900">
                  Create Account
                </h1>
                <p className="text-blue-600/70 mt-2">
                  Join Interestia and start your journey
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-700 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition placeholder:text-blue-300"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-700 ml-1">
                    Username
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="@username"
                      className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition placeholder:text-blue-300"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-700 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="hello@interestia.com"
                      className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition placeholder:text-blue-300"
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
                      className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300 transition placeholder:text-blue-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white/90 text-blue-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <p className="text-center">
                <Link
                  href="/login"
                  className="text-blue-500 font-medium hover:text-blue-600 transition-colors hover:underline underline-offset-4"
                >
                  Sign in here →
                </Link>
              </p>
            </div>
          </div>

          {/* IMAGE SECTION */}
          <div className="relative flex flex-col items-center justify-center bg-linear-to-br from-blue-200 to-indigo-200 p-8 md:p-12 order-1 md:order-2 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Welcome!
              </h2>
              <p className="text-blue-800/70">
                Start your journey with us today
              </p>
            </div>

            <div className="relative z-10 w-full max-w-sm">
              <Image
                src="/image/register.png"
                alt="Register Illustration"
                width={300}
                height={300}
                className="w-full h-auto drop-shadow-xl"
                priority
              />
            </div>

            {/* Features list */}
            <div className="relative z-10 mt-8 space-y-3 w-full max-w-sm">
              <div className="flex items-center gap-3 text-blue-900/80">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Connect with like-minded people</span>
              </div>
              <div className="flex items-center gap-3 text-blue-900/80">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Discover your interests</span>
              </div>
              <div className="flex items-center gap-3 text-blue-900/80">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Join amazing communities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <Modal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)}>
        <div className="text-center p-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-blue-500" />
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-3">
            Registration Successful!
          </h2>

          <p className="text-blue-600/70 mb-8">
            Your account has been created successfully. <br />
            You can now sign in to start your journey.
          </p>

          <button
            onClick={handleRedirectLogin}
            className="px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200/50"
          >
            Go to Login
          </button>
        </div>
      </Modal>
    </>
  );
}
