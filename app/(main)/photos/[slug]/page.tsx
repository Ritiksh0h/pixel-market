import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPhotoBySlug } from "@/lib/actions/photos";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Aperture,
  Timer,
  Gauge,
  Maximize,
  HardDrive,
  MapPin,
  Calendar,
  Eye,
  Heart,
  Download,
} from "lucide-react";
import { getInitials, formatNumber } from "@/lib/utils";
import { LikeButton } from "@/components/photos/like-button";
import { CommentSection } from "@/components/photos/comment-section";
import { PurchasePanel } from "@/components/photos/purchase-panel";

export default async function PhotoPage({ params }: { params: { slug: string } }) {
  const photo = await getPhotoBySlug(params.slug);
  if (!photo) notFound();

  // Get more from this photographer
  const morePhotos = await db.query.photos.findMany({
    where: and(
      eq(photos.userId, photo.userId),
      eq(photos.isPublished, true)
    ),
    orderBy: desc(photos.createdAt),
    limit: 6,
  });

  const metadataItems = [
    { icon: Camera, label: "Camera", value: photo.camera },
    { icon: Aperture, label: "Lens", value: photo.lens },
    { icon: Aperture, label: "Aperture", value: photo.aperture },
    { icon: Timer, label: "Shutter", value: photo.shutterSpeed },
    { icon: Gauge, label: "ISO", value: photo.iso },
    { icon: Maximize, label: "Resolution", value: photo.width && photo.height ? `${photo.width} × ${photo.height}` : null },
    { icon: HardDrive, label: "Size", value: photo.fileSize ? `${(photo.fileSize / 1024 / 1024).toFixed(1)} MB` : null },
    { icon: Calendar, label: "Taken", value: photo.dateTaken ? new Date(photo.dateTaken).toLocaleDateString() : null },
    { icon: MapPin, label: "Location", value: photo.hideLocation ? null : photo.locationTaken },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content — flex row matching original */}
      <div className="flex flex-col lg:flex-row flex-1 p-4">
        {/* Main photo */}
        <div className="flex-grow relative">
          <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full bg-black">
            <Image
              src={photo.watermarkedUrl || photo.originalUrl}
              alt={photo.title}
              fill
              className="object-contain transition-opacity duration-300 ease-in-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
              priority
            />
          </div>
        </div>

        {/* Sidebar — narrow w-64 matching original */}
        <div className="w-full lg:w-64 flex flex-col p-4 space-y-4">
          {/* Photographer */}
          <Link href={`/photographers/${photo.user.username}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={photo.user.image || undefined} />
              <AvatarFallback>{getInitials(photo.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{photo.user.name}</p>
              <p className="text-xs text-muted-foreground">@{photo.user.username}</p>
            </div>
          </Link>

          {/* Metadata */}
          {metadataItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Details</h3>
              {metadataItems.map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Purchase options */}
          <PurchasePanel photo={photo} />

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(photo.viewCount)}</span>
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(photo.likeCount)}</span>
            <span className="flex items-center gap-1"><Download className="h-3 w-3" />{formatNumber(photo.downloadCount)}</span>
          </div>

          <LikeButton photoId={photo.id} initialLiked={photo.isLiked} likeCount={photo.likeCount} />
        </div>
      </div>

      {/* More from photographer */}
      {morePhotos.length > 1 && (
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-semibold">More from {photo.user.name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {morePhotos
              .filter((p) => p.id !== photo.id)
              .slice(0, 6)
              .map((p) => (
                <Link key={p.id} href={`/photos/${p.slug}`}>
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <Image src={p.thumbnailUrl} alt={p.title} fill className="object-cover hover:scale-105 transition-transform" sizes="150px" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {photo.tags.length > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {photo.tags.map((pt: any) => (
            <Link key={pt.tag.id} href={`/search?q=${pt.tag.name}`}>
              <Badge variant="outline" className="hover:bg-secondary">#{pt.tag.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Comments */}
      <div className="p-4">
        <CommentSection photoId={photo.id} comments={photo.comments} />
      </div>
    </div>
  );
}
