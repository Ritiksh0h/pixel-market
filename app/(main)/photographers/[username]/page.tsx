import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile } from "@/lib/actions/users";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, formatNumber } from "@/lib/utils";
import { FollowButton } from "@/components/shared/follow-button";
import {
  Twitter,
  Instagram,
  Globe,
  Users,
  Heart,
  ImageIcon,
  DollarSign,
} from "lucide-react";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const profile = await getUserProfile(params.username);
  if (!profile) return { title: "Photographer not found" };
  const name = profile.name || profile.username;
  return {
    title: `${name} — Photographer`,
    description: profile.bio || `${name}'s photography portfolio on PixelMarket. ${profile.photoCount} photos.`,
    openGraph: {
      title: `${name} — Photographer on PixelMarket`,
      description: profile.bio || `Browse ${name}'s portfolio`,
      images: profile.image ? [{ url: profile.image }] : [],
    },
  };
}

export default async function PhotographerProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getUserProfile(params.username);
  if (!profile) notFound();

  const portfolioCategories = [
    "All",
    "For Sale",
    "For Rent",
    "Auction",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Cover image */}
        <div className="relative h-[240px] md:h-[320px] overflow-hidden">
          {profile.coverImage ? (
            <Image
              src={profile.coverImage}
              alt="Cover photo"
              className="object-cover"
              fill
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </div>

        {/* Profile header — overlapping cover */}
        <div className="container relative -mt-16 md:-mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-8">
            <div className="relative w-32 h-32 rounded-full border-4 border-background overflow-hidden">
              <Avatar className="h-full w-full">
                <AvatarImage src={profile.image || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 pb-4 md:pb-6">
              <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {profile.name}
                  </h1>
                  <p className="text-white/80">{profile.location || `@${profile.username}`}</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="secondary">Message</Button>
                  {!profile.isOwnProfile ? (
                    <FollowButton
                      userId={profile.id}
                      initialFollowing={profile.isFollowing}
                    />
                  ) : (
                    <Button asChild>
                      <Link href="/settings">Edit Profile</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Left sidebar */}
            <div className="space-y-6">
              {/* About */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">About</h2>
                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}

                <div className="flex items-center space-x-3">
                  {profile.website && (
                    <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}
                  {profile.twitterHandle && (
                    <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                      <a href={`https://twitter.com/${profile.twitterHandle}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4 mr-1" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {profile.instagramHandle && (
                    <Button variant="outline" size="sm" className="h-8 px-2" asChild>
                      <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 mr-1" />
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats — matching original 3-column grid with icons */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Stats</h2>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border rounded-md p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-bold">{formatNumber(profile.followerCount)}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-bold">{formatNumber(profile.photoCount)}</div>
                    <div className="text-xs text-muted-foreground">Photos</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="font-bold">{formatNumber(profile.followingCount)}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Photo portfolio */}
            <div className="md:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Photo Portfolio</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {profile.photoCount} Photos
                  </Button>
                </div>
              </div>

              {/* Category tabs — horizontal scroll */}
              <div className="flex overflow-x-auto py-2 space-x-2 scrollbar-hide">
                {portfolioCategories.map((category, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Photo grid with price badges */}
              {profile.photos.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No photos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.photos.map((photo) => (
                    <Link
                      key={photo.id}
                      href={`/photos/${photo.slug}`}
                      className="group rounded-lg overflow-hidden border shadow-sm"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={photo.thumbnailUrl}
                          alt={photo.title}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Price badge */}
                        {(photo.forSale || photo.forRent || photo.forAuction) && (
                          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            {photo.forSale && photo.salePrice && `Buy $${photo.salePrice}`}
                            {photo.forRent && photo.rentPriceMonthly && !photo.forSale && `Rent $${photo.rentPriceMonthly}`}
                            {photo.forAuction && photo.auctionStartBid && !photo.forSale && !photo.forRent && `Bid $${photo.auctionStartBid}`}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium">{photo.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
