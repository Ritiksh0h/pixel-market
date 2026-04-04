"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory?: string;
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      <Link
        href="/dashboard"
        className={cn(
          "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
          !activeCategory
            ? "bg-foreground text-background"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/dashboard?category=${cat.id}`}
          className={cn(
            "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            activeCategory === cat.id
              ? "bg-foreground text-background"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
