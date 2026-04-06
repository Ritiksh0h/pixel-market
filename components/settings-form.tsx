"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/skeleton-label-separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { updateProfileAction } from "@/lib/actions/users";
import { toast } from "@/components/ui/toaster";
import { getInitials } from "@/lib/utils";
import { Camera, Save } from "lucide-react";

interface ProfileData {
  name: string;
  username: string;
  image: string;
  bio: string;
  location: string;
  website: string;
  twitterHandle: string;
  instagramHandle: string;
}

export function SettingsForm({ profile }: { profile: ProfileData }) {
  const { update } = useSession();
  const router = useRouter();
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
      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success("Profile updated!");
        await update({
          name: fd.get("name"),
          username: fd.get("username"),
        });
        router.refresh();
      }
    });
  }

  return (
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
                <AvatarImage src={avatarPreview || profile.image || undefined} />
                <AvatarFallback className="text-xl">{getInitials(profile.name)}</AvatarFallback>
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
              <p className="text-sm font-medium">{profile.name}</p>
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
              <Input id="name" name="name" defaultValue={profile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" defaultValue={profile.username} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={profile.bio}
              placeholder="Tell people about yourself"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={profile.location} placeholder="Denver, Colorado" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={profile.website} placeholder="https://yoursite.com" />
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
              <Input id="twitterHandle" name="twitterHandle" defaultValue={profile.twitterHandle} placeholder="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram</Label>
              <Input id="instagramHandle" name="instagramHandle" defaultValue={profile.instagramHandle} placeholder="username" />
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
  );
}
