'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { space } from "@/app/fonts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const publicNavLinks = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

type HeaderProps = {
  showNavLinks?: boolean;
  showAuthButtons?: boolean;
  showProfileMenu?: boolean;
  userInitials?: string;
  navVariant?: "public" | "app";
};

const Header = ({
  showNavLinks = true,
  showAuthButtons = true,
  showProfileMenu = false,
  userInitials = "U",
  navVariant = "public",
}: HeaderProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  };

  const appNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    {
      label: "Workflow",
      href: "https://www.youtube.com",
      external: true,
    },
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/pricing" },
  ];

  const navLinks = navVariant === "app" ? appNavLinks : publicNavLinks;
  return (
    <header className="reveal flex items-center justify-between">
      <div
        className="flex items-center gap-3"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      >
        <div className="glow-ring flex h-10 w-10 items-center justify-center rounded-full bg-[#101821]">
          <span className={`${space.className} text-sm font-bold`}>CID</span>
        </div>
        <div>
          <p className={`${space.className} text-lg font-semibold`}>
            careerIDream
          </p>
          <p className="text-xs text-white/60">AI resume and cover letter</p>
        </div>
      </div>
      {showNavLinks ? (
        <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              className="nav-underline transition hover:text-white"
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-3">
        {showAuthButtons ? (
          <>
            <Link
              className="hidden rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white md:inline-flex"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0c1116] shadow-lg shadow-white/10 transition hover:-translate-y-0.5"
              href="/signup"
            >
              Sign up
            </Link>
          </>
        ) : null}
        {showProfileMenu ? (
          <div className="relative" ref={menuRef}>
            <button
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white transition hover:border-white/40"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              {userInitials}
            </button>
            {isMenuOpen ? (
              <div className="absolute right-0 mt-3 w-44 rounded-2xl border border-white/10 bg-[#0f1720] p-2 text-xs text-white/80 shadow-xl shadow-black/40">
                <Link
                  className="block rounded-xl px-3 py-2 transition hover:bg-white/10"
                  href="/profile"
                >
                  Profile
                </Link>
                <Link
                  className="block rounded-xl px-3 py-2 transition hover:bg-white/10"
                  href="/settings"
                >
                  Settings
                </Link>
                <button
                  className="cursor-pointer block w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
