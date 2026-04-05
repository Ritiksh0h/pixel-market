"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MoreHorizontal } from "lucide-react";

interface PhotoCardProps {
  photo: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    likeCount: number;
    viewCount: number;
    forSale: boolean;
    salePrice: number | null;
    forRent: boolean;
    rentPriceMonthly: number | null;
    forAuction: boolean;
    auctionStartBid: number | null;
    user: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
  };
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const goToPhotographer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/photographers/${photo.user.username}`);
  };

  return (
    <div className="relative break-inside-avoid mb-4 group">
      <Link
        href={`/photos/${photo.slug}`}
        className="block"
      >
        <div className="relative overflow-hidden rounded-lg">
          <Image
            width={500}
            height={500}
            src={photo.thumbnailUrl}
            alt={photo.title}
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bottom info bar — uses div+onClick instead of nested Link */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                onClick={goToPhotographer}
                role="link"
                tabIndex={0}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={photo.user.image || undefined} />
                  <AvatarFallback>
                    {photo.user.username?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-xs">
                  @{photo.user.username}
                </span>
              </div>
              <h3 className="font-medium text-xs text-background">
                {photo.title}
              </h3>
            </div>
          </div>

          {/* Top right actions */}
          <div className="absolute top-2 right-2 flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              onClick={toggleBookmark}
            >
              <Bookmark
                className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
              />
              <span className="sr-only">Bookmark</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="More options"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem>Download</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price badge */}
          {photo.forSale && photo.salePrice && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-black/70 text-white border-0 text-xs">
                Buy ${photo.salePrice}
              </Badge>
            </div>
          )}
          {photo.forRent && photo.rentPriceMonthly && !photo.forSale && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-black/70 text-white border-0 text-xs">
                Rent ${photo.rentPriceMonthly}
              </Badge>
            </div>
          )}
          {photo.forAuction && photo.auctionStartBid && !photo.forSale && !photo.forRent && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-black/70 text-white border-0 text-xs">
                Bid ${photo.auctionStartBid}
              </Badge>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
