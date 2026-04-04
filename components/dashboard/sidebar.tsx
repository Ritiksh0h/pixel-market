"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Bookmark, TrendingUp, Clock, Filter } from "lucide-react";

interface SidebarProps {
  categories: { id: string; name: string; slug: string }[];
}

export function DashboardSidebar({ categories }: SidebarProps) {
  const tags = [
    "photography", "landscape", "portrait", "urban", "minimal",
    "colorful", "blackandwhite", "abstract", "vintage", "macro",
  ];

  const trending = [
    { title: "Mountain Views", username: "sophiathomas" },
    { title: "Urban Exploration", username: "michaelchen" },
    { title: "Summer Vibes", username: "jessicapark" },
    { title: "Minimal Design", username: "alexsmith" },
  ];

  return (
    <div className="gap-4 space-y-4 py-4 sticky top-16">
      {/* Categories */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.length === 0
              ? ["Nature", "Travel", "Food", "Architecture", "People"].map((name) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="text-sm">{name}</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                ))
              : categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/dashboard?category=${cat.id}`}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{cat.name}</span>
                  </Link>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/search?q=${tag}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Now */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trending.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">@{item.username}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">You viewed 12 images today</p>
            <p className="text-sm text-muted-foreground">You saved 3 images to collections</p>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Bookmark className="h-4 w-4 mr-2" />
              View Saved Images
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
