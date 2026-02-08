"use client";

import Link from "next/link";

import { sora, space } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFoundPage = () => {
  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -left-24 top-6 h-64 w-64 rounded-full bg-[#102b2a] blur-3xl" />
        <div className="absolute right-8 top-16 h-72 w-72 rounded-full bg-[#18253b] blur-3xl" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col px-6 pb-16 pt-8">
          <Header showNavLinks={false} showAuthButtons={false} />
          <section className="mx-auto mt-14 flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              404 error
            </p>
            <h1 className={`${space.className} mt-4 text-4xl`}>
              Page does not exist
            </h1>
            <p className="mt-3 text-sm text-white/70">
              The page you are looking for might have been moved, renamed, or
              never existed.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:-translate-y-0.5"
              >
                Go to home
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40"
              >
                Go to login
              </Link>
            </div>
          </section>
        </div>
        <Footer variant="minimal" />
      </main>
    </div>
  );
};

export default NotFoundPage;
