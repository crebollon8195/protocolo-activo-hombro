"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export function LogoutButton({ label = "Cerrar sesión" }: { label?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/landing");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm font-primary font-semibold text-text-secondary hover:text-primary transition-colors"
    >
      <LogOut className="w-4 h-4" />
      {label}
    </button>
  );
}
