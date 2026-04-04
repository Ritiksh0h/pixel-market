"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/skeleton-label-separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { updateProfileAction } from "@/lib/actions/users";
import { toast } from "@/components/ui/toaster";
import { getInitials } from "@/lib/utils";
import { Camera, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated!");
        // Update session data
        await update({
          name: fd.get("name"),
          username: fd.get("username"),
        });
      }
    });
  }

  if (!session?.user) return null;

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || session.user.image || undefined} />
                  <AvatarFallback className="text-xl">{getInitials(session.user.name)}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">Click the camera icon to change</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic information</CardTitle>
            <CardDescription>This information is visible on your public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" defaultValue={session.user.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={(session.user as any).username || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Tell people about yourself"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Denver, Colorado" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" placeholder="https://yoursite.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitterHandle">Twitter</Label>
                <Input id="twitterHandle" name="twitterHandle" placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Instagram</Label>
                <Input id="instagramHandle" name="instagramHandle" placeholder="username" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
