"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onLogout() {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={onLogout} disabled={isLoading}>
      {isLoading ? "Keluar..." : "Keluar"}
    </Button>
  );
}
