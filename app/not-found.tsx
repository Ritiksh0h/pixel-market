import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Camera className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-5xl font-bold mb-2">404</p>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Search photos
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
