"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import Modal from "@/app/_components/ui/modal";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl grid md:grid-cols-2 overflow-hidden">
          {/* IMAGE SECTION */}
          <div className="flex flex-col items-center justify-center bg-indigo-50 p-6 md:p-10 md:order-2">
            <Image
              src="/image/register.png"
              alt="Register Illustration"
              width={200}
              height={200}
              className="w-32 md:w-60 h-auto"
              priority
            />
          </div>

          {/* FORM SECTION */}
          <div className="flex items-center justify-center p-8 md:order-1">
            <div className="w-full max-w-sm">
              <h1 className="text-3xl font-bold text-slate-800 text-center">
                Create Account
              </h1>
              <p className="text-center text-slate-500 mt-2 mb-6">
                Join Interestia today
              </p>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Sign Up"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{" "}
                <span
                  onClick={() => router.push("/login")}
                  className="text-indigo-600 font-medium cursor-pointer hover:underline"
                >
                  Sign in
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <Modal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)}>
        <h2 className="text-lg font-semibold mb-4 text-center">
          Registration Successful!
        </h2>

        <p className="text-sm text-slate-600 text-center mb-6">
          Your account has been created successfully.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleRedirectLogin}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </Modal>
    </>
  );
}
