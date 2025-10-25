import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Mail, Calendar, Shield, User as UserIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import  SignOutButtonComponent  from "./sign-out-button";
import { EditProfileButton } from "./edit-profile-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - ISPGram",
  description: "Manage your ISPGram account and view your profile information",
};

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "User";

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    null;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account information</p>
        </div>
        <div className="flex gap-2">
          <EditProfileButton />
          <SignOutButtonComponent />
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden border-orange-100">
        <div className="bg-gradient-to-r from-orange-50 via-purple-50 to-orange-50 p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-orange-200">
              <AvatarImage src={user.imageUrl} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-purple-400 text-xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                {user.username && (
                  <p className="text-sm text-gray-600">@{user.username}</p>
                )}
              </div>

              {primaryEmail && (
                <div className="flex items-center justify-center gap-2 text-gray-700 sm:justify-start">
                  <Mail className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">{primaryEmail}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Badge>
                {user.lastSignInAt && (
                  <Badge variant="outline" className="gap-1">
                    <UserIcon className="h-3 w-3" />
                    Last login {new Date(user.lastSignInAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Separator className="mb-6" />

          {/* Account Details */}
          <div className="space-y-6">
            {/* Email Addresses */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Mail className="h-5 w-5 text-orange-600" />
                Email Addresses
              </h3>
              <div className="space-y-2">
                {user.emailAddresses.length > 0 ? (
                  user.emailAddresses.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                    >
                      <span className="font-medium text-gray-900">
                        {email.emailAddress}
                      </span>
                      <div className="flex gap-2">
                        {email.id === user.primaryEmailAddressId && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Primary
                          </Badge>
                        )}
                        {email.verification?.status === "verified" && (
                          <Badge
                            variant="outline"
                            className="border-green-200 text-green-700"
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No email addresses found</p>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <UserIcon className="h-5 w-5 text-orange-600" />
                Account Information
              </h3>
              <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User ID</span>
                  <code className="text-xs text-gray-900">{user.id}</code>
                </div>
                {user.firstName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      First Name
                    </span>
                    <span className="text-sm text-gray-900">{user.firstName}</span>
                  </div>
                )}
                {user.lastName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Last Name</span>
                    <span className="text-sm text-gray-900">{user.lastName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Account Status
                  </span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}