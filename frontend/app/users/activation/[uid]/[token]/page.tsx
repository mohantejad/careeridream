"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { sora, space } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const ActivationPage = () => {
  const router = useRouter();
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const missingParams = !uid || !token;
  const [status, setStatus] = useState<{
    type: "loading" | "error" | "success";
    message: string;
  }>(() =>
    missingParams
      ? {
          type: "error",
          message: "Activation link is invalid or incomplete.",
        }
      : { type: "loading", message: "Activating your account..." }
  );

  useEffect(() => {
    if (missingParams) return;

    const activate = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/users/activation/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid, token }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          setStatus({
            type: "error",
            message:
              "Unable to activate your account. " +
              (errorText ? "Please request a new link." : "Please try again."),
          });
          return;
        }

        setStatus({
          type: "success",
          message: "Account activated! Redirecting you to login...",
        });

        setTimeout(() => router.replace("/login"), 1500);
      } catch {
        setStatus({
          type: "error",
          message: "Network error. Please try again.",
        });
      }
    };

    void activate();
  }, [missingParams, router, token, uid]);

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -left-24 top-6 h-64 w-64 rounded-full bg-[#102b2a] blur-3xl" />
        <div className="absolute right-8 top-16 h-72 w-72 rounded-full bg-[#18253b] blur-3xl" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col px-6 pb-16 pt-8">
          <Header showNavLinks={false} showAuthButtons={false} />
          <section className="mx-auto mt-16 w-full max-w-lg">
            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-8 text-center shadow-2xl shadow-black/40">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Account activation
              </p>
              <h1 className={`${space.className} mt-2 text-3xl`}>
                {status.type === "error"
                  ? "Activation failed"
                  : "Activating your account"}
              </h1>
              <p className="mt-4 text-sm text-white/70">{status.message}</p>
              {status.type === "error" ? (
                <button
                  className="mt-6 rounded-full border border-white/20 px-6 py-2 text-sm text-white/80 transition hover:border-white/60"
                  onClick={() => router.replace("/signup")}
                >
                  Back to signup
                </button>
              ) : null}
            </div>
          </section>
        </div>
        <Footer variant="minimal" />
      </main>
    </div>
  );
};

export default ActivationPage;
