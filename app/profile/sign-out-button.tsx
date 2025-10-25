"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButtonComponent() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="outline"
      className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
