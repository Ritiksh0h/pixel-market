import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPhotoBySlug } from "@/lib/actions/photos";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera, Aperture, Timer, Gauge, Maximize, HardDrive,
  MapPin, Calendar, Eye, Heart, Download, Share2,
} from "lucide-react";
import { getInitials, formatNumber, timeAgo } from "@/lib/utils";
import { LikeButton } from "@/components/photos/like-button";
import { CommentSection } from "@/components/photos/comment-section";
import { PurchasePanel } from "@/components/photos/purchase-panel";
import { OwnerActions } from "@/components/photos/owner-actions";
import { ShareButton } from "@/components/photos/share-button";
import { SaveToCollectionButton } from "@/components/collections/save-to-collection";
import { FollowButton } from "@/components/shared/follow-button";

export default async function PhotoPage({ params }: { params: { slug: string } }) {
  const photo = await getPhotoBySlug(params.slug);
  if (!photo) notFound();
  const session = await auth();
  const isOwner = session?.user?.id === photo.userId;

  const morePhotos = await db.query.photos.findMany({
    where: and(eq(photos.userId, photo.userId), eq(photos.isPublished, true)),
    orderBy: desc(photos.createdAt),
    limit: 7,
  });

  const metadataItems = [
    { icon: Camera, label: "Camera", value: photo.camera },
    { icon: Aperture, label: "Lens", value: photo.lens },
    { icon: Aperture, label: "Aperture", value: photo.aperture },
    { icon: Timer, label: "Shutter", value: photo.shutterSpeed },
    { icon: Gauge, label: "ISO", value: photo.iso },
    { icon: Gauge, label: "Focal length", value: photo.focalLength },
    { icon: Maximize, label: "Resolution", value: photo.width && photo.height ? `${photo.width} × ${photo.height}` : null },
    { icon: HardDrive, label: "Size", value: photo.fileSize ? `${(photo.fileSize / 1024 / 1024).toFixed(1)} MB` : null },
    { icon: Calendar, label: "Taken", value: photo.dateTaken ? new Date(photo.dateTaken).toLocaleDateString() : null },
    { icon: MapPin, label: "Location", value: photo.hideLocation ? null : photo.locationTaken },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ═══ MAIN: Photo + Sidebar side-by-side ═══ */}
      <div className="flex flex-col lg:flex-row flex-1">

        {/* Photo viewer — takes remaining space */}
        <div className="flex-grow relative bg-black">
          <div className="relative h-[50vh] md:h-[60vh] lg:h-[80vh] w-full">
            <Image
              src={photo.watermarkedUrl || photo.originalUrl}
              alt={photo.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 75vw"
              priority
            />
          </div>
        </div>

        {/* Sidebar — fixed width */}
        <div className="w-full lg:w-80 flex-shrink-0 border-l bg-background overflow-y-auto lg:max-h-[80vh]">
          <div className="p-5 space-y-5">

            {/* Photographer */}
            <div className="flex items-center gap-3">
              <Link href={`/photographers/${photo.user.username}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={photo.user.image || undefined} />
                  <AvatarFallback className="text-xs">{getInitials(photo.user.name)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/photographers/${photo.user.username}`} className="hover:underline">
                  <p className="font-semibold text-sm truncate">{photo.user.name}</p>
                </Link>
                <p className="text-xs text-muted-foreground">@{photo.user.username}</p>
              </div>
              {!isOwner ? (
                <FollowButton userId={photo.userId} initialFollowing={photo.isFollowing} />
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/photographers/${photo.user.username}`}>Profile</Link>
                </Button>
              )}
            </div>

            {/* Title + description */}
            <div>
              <h1 className="text-lg font-bold">{photo.title}</h1>
              {photo.description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{photo.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{timeAgo(new Date(photo.createdAt))}</p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNumber(photo.viewCount)} views</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{formatNumber(photo.likeCount)} likes</span>
              <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{formatNumber(photo.downloadCount)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LikeButton photoId={photo.id} initialLiked={photo.isLiked} likeCount={photo.likeCount} />
              <SaveToCollectionButton photoId={photo.id} />
              <ShareButton title={photo.title} slug={photo.slug} />
            </div>

            {/* EXIF metadata */}
            {metadataItems.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
                {metadataItems.map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </span>
                    <span className="font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t">
                {photo.tags.map((pt: any) => (
                  <Link key={pt.tag.id} href={`/search?q=${pt.tag.name}`}>
                    <Badge variant="outline" className="text-xs hover:bg-secondary cursor-pointer">
                      #{pt.tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Purchase / Download panel */}
            <div className="pt-3 border-t">
              <PurchasePanel photo={photo} isOwner={isOwner} isLoggedIn={!!session} />
            </div>

            {/* Owner actions — delete, edit, archive */}
            {isOwner && (
              <div className="pt-3 border-t">
                <OwnerActions photoId={photo.id} photoSlug={photo.slug} isPublished={photo.isPublished} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ BELOW: More photos + Comments ═══ */}

      {/* More from photographer */}
      {morePhotos.filter((p) => p.id !== photo.id).length > 0 && (
        <div className="p-4 space-y-3 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">More from {photo.user.name}</h3>
            <Link href={`/photographers/${photo.user.username}`} className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {morePhotos
              .filter((p) => p.id !== photo.id)
              .slice(0, 6)
              .map((p) => (
                <Link key={p.id} href={`/photos/${p.slug}`}>
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                    <Image src={p.thumbnailUrl} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="150px" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="p-4 border-t">
        <CommentSection photoId={photo.id} comments={photo.comments} />
      </div>
    </div>
  );
}
