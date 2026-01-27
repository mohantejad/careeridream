"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      try {
        const response = await apiFetch("/auth/users/me/");
        if (!isMounted) return;
        if (response.ok) {
          setIsAllowed(true);
          return;
        }
      } catch {
        if (!isMounted) return;
      }

      router.replace("/login");
    };

    void verify().finally(() => {
      if (isMounted) setIsChecking(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isChecking) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

