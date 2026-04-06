"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Upload,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  BookmarkIcon,
  Clock,
  TrendingUp,
  Camera,
  Check,
  UserPlus,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  FileImage,
  Film,
  FolderUp,
  UploadCloud,
  Heart,
  Gavel,
  Shield,
} from "lucide-react";
import { getNotifications, markNotificationsReadAction } from "@/lib/actions/users";
import { timeAgo } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

// ═══════════════════════════════════════
// SITE HEADER (matches original layout)
// ═══════════════════════════════════════
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center gap-2 md:h-16 md:gap-4">
        <Link href="/dashboard" className="flex items-center shrink-0">
          <span className="font-bold text-lg md:text-xl">PixelMarket</span>
        </Link>
        {/* Search — full bar on desktop, icon trigger on mobile */}
        <div className="flex-1 hidden md:block">
          <SearchDropdown />
        </div>
        <MobileSearchButton />
        <div className="flex items-center gap-1 md:gap-2">
          <UploadDropdown />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}

function MobileSearchButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => router.push("/search")}
    >
      <Search className="h-5 w-5" />
    </Button>
  );
}

// ═══════════════════════════════════════
// SEARCH DROPDOWN (exact original design)
// ═══════════════════════════════════════
function SearchDropdown() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const recentSearches = ["landscape photography", "portrait", "black and white"];
  const popularCategories = [
    { name: "Nature", count: "25K+ photos" },
    { name: "Architecture", count: "18K+ photos" },
    { name: "People", count: "32K+ photos" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cmd+K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (term: string) => {
    setSearchValue(term);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search photos, photographers, or categories..."
          className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && searchValue.trim()) handleSearch(searchValue.trim()); }}
        />
      </div>

      {isFocused && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-background shadow-lg z-50">
          <div className="p-3">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Recent Searches
            </h3>
            <div className="space-y-2">
              {recentSearches.map((term, i) => (
                <div key={i} className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer" onClick={() => handleSearch(term)}>
                  <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {term}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t" />
          <div className="p-3">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Popular Categories
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {popularCategories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer" onClick={() => handleSearch(cat.name)}>
                  <div className="flex items-center">
                    <Camera className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    {cat.name}
                  </div>
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
          {searchValue && (
            <>
              <div className="border-t" />
              <div className="p-3 text-center text-sm text-primary font-medium cursor-pointer hover:bg-muted" onClick={() => handleSearch(searchValue)}>
                Search for &quot;{searchValue}&quot;
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// UPLOAD DROPDOWN (exact original design)
// ═══════════════════════════════════════
function UploadDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden md:inline">Upload</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel>Upload Content</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => { router.push("/upload"); setIsOpen(false); }} className="py-3 cursor-pointer">
            <FileImage className="h-4 w-4 mr-3 text-blue-500" />
            <div className="flex flex-col">
              <span className="font-medium">Upload Photo</span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP (max 50MB)</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => toast.info("Video uploads coming soon")}>
            <Film className="h-4 w-4 mr-3 text-red-500" />
            <div className="flex flex-col">
              <span className="font-medium">Upload Video</span>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => toast.info("Collection uploads coming soon")}>
            <FolderUp className="h-4 w-4 mr-3 text-amber-500" />
            <div className="flex flex-col">
              <span className="font-medium">Upload Collection</span>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => toast.info("Bulk uploads coming soon")}>
          <UploadCloud className="h-4 w-4 mr-3 text-purple-500" />
          <div className="flex flex-col">
            <span className="font-medium">Bulk Upload</span>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ═══════════════════════════════════════
// NOTIFICATION DROPDOWN (real DB data)
// ═══════════════════════════════════════
type DBNotification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actor: { id: string; name: string | null; username: string | null; image: string | null } | null;
};

function NotificationDropdown() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch when dropdown opens
  useEffect(() => {
    if (open && !loaded && session?.user) {
      getNotifications().then((data) => {
        setNotifications(data as DBNotification[]);
        setLoaded(true);
      });
    }
  }, [open, loaded, session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    await markNotificationsReadAction();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "follow": return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "like": return <Heart className="h-4 w-4 text-red-500" />;
      case "comment": return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case "purchase": return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "rent": return <DollarSign className="h-4 w-4 text-amber-500" />;
      case "auction_bid": return <Gavel className="h-4 w-4 text-purple-500" />;
      case "auction_won": return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
      case "message": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500" variant="destructive">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={markAllAsRead}>
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {!loaded ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className={`flex items-start p-3 ${!n.isRead ? "bg-muted/50" : ""}`}>
                  <div className="mr-2 mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex flex-col space-y-1 flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(new Date(n.createdAt))}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-center text-sm">
          {notifications.length > 0
            ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`
            : "You\u2019re all caught up"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ═══════════════════════════════════════
// USER DROPDOWN (exact original with theme toggle)
// ═══════════════════════════════════════
function UserDropdown() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  if (!session?.user) {
    return <Button size="sm" asChild><Link href="/login">Sign in</Link></Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {
            const username = (session.user as any).username;
            if (username) router.push(`/photographers/${username}`);
            else router.push("/settings");
          }}>
            <User className="mr-2 h-4 w-4" /><span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/collections")}>
            <BookmarkIcon className="mr-2 h-4 w-4" /><span>Collections</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/purchases")}>
            <ShoppingCart className="mr-2 h-4 w-4" /><span>My Purchases</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/earnings")}>
            <DollarSign className="mr-2 h-4 w-4" /><span>Earnings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" /><span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <Shield className="mr-2 h-4 w-4" /><span>Admin</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? (
            <><Moon className="mr-2 h-4 w-4" /><span>Dark mode</span></>
          ) : (
            <><Sun className="mr-2 h-4 w-4" /><span>Light mode</span></>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
