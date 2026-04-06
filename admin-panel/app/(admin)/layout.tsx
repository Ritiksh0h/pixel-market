import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, ImageIcon, ArrowLeft, Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!admins.includes(session.user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col">
        <div className="p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span className="font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <AdminNavLink href="/admin" icon={LayoutDashboard}>Dashboard</AdminNavLink>
          <AdminNavLink href="/admin/users" icon={Users}>Users</AdminNavLink>
          <AdminNavLink href="/admin/photos" icon={ImageIcon}>Photos</AdminNavLink>
        </nav>
        <div className="p-3 border-t">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center gap-4 px-4 h-12">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-bold text-sm">Admin</span>
          </Link>
          <div className="flex gap-3 ml-auto text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Stats</Link>
            <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
            <Link href="/admin/photos" className="text-muted-foreground hover:text-foreground">Photos</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">← App</Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 md:pt-0 pt-12">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
