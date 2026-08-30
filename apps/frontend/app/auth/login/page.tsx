"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";

export default function LoginPage() {
  const router = useRouter();
  const openAuth = useAuthModalStore((state) => state.open);

  useEffect(() => {
    openAuth("login");
    router.replace("/");
  }, [openAuth, router]);

  return null;
}
