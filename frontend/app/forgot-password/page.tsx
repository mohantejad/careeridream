"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Link from "next/link";

import { sora, space } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "error" | "success";
    message: string;
  }>({ type: "idle", message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/reset_password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as Record<string, string[]>;
        const fallback =
          "Unable to send reset email. Please try again later.";
        const firstError = Object.values(errorData)[0]?.[0] ?? fallback;
        setStatus({ type: "error", message: firstError });
        return;
      }

      setStatus({
        type: "success",
        message:
          "If an account exists for this email, you will receive a reset link shortly.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -left-24 top-6 h-64 w-64 rounded-full bg-[#102b2a] blur-3xl" />
        <div className="absolute right-8 top-16 h-72 w-72 rounded-full bg-[#18253b] blur-3xl" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col px-6 pb-16 pt-8">
          <Header showNavLinks={false} showAuthButtons={false} />
          <section className="mx-auto mt-14 w-full max-w-xl">
            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-8 shadow-2xl shadow-black/40">
              <div className="space-y-2 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Reset password
                </p>
                <h1 className={`${space.className} text-3xl`}>
                  Find your account
                </h1>
                <p className="text-sm text-white/70">
                  Enter your email and we will send you a password reset link.
                </p>
              </div>

              {status.type !== "idle" ? (
                <div
                  className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "border-[#6de5c1]/40 bg-[#6de5c1]/10 text-[#b6f6df]"
                      : "border-[#ff7a6b]/40 bg-[#ff7a6b]/10 text-[#ffb0a8]"
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="text-xs text-white/60" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#6de5c1]/60"
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address.",
                      },
                    })}
                  />
                  {errors.email ? (
                    <p className="text-xs text-[#ffb0a8]">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  className="cursor-pointer mt-2 w-full rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/60">
                Remembered your password?{" "}
                <Link className="text-[#6de5c1] hover:text-[#a8f0d8] cursor-pointer" href="/login">
                  Back to login
                </Link>
              </p>
            </div>
          </section>
        </div>
        <Footer variant="minimal" />
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
