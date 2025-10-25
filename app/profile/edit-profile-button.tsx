"use client";

import { UserProfile } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export function EditProfileButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Edit Profile</DialogTitle>
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0",
              navbar: "hidden",
              pageScrollBox: "p-6",
              profileSection: "border-gray-200",
              profileSectionTitle: "text-gray-900 font-semibold",
              profileSectionContent: "space-y-4",
              formButtonPrimary:
                "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800",
              formButtonReset: "text-orange-600 hover:text-orange-700",
              badge: "bg-orange-100 text-orange-800",
              alertRoot: "border-orange-200 bg-orange-50",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
