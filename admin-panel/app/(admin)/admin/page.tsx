import { getAdminStats } from "@/lib/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ImageIcon, ShoppingCart, DollarSign, TrendingUp, Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, sub: `+${stats.recentUsers} this week`, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Photos", value: stats.totalPhotos, sub: `+${stats.recentPhotos} this week`, icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Purchases", value: stats.totalPurchases, sub: "completed", icon: ShoppingCart, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, sub: "all time", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5 pb-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Actions
            </h3>
            <div className="space-y-2 text-sm">
              <a href="/admin/users" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors">
                Manage users →
              </a>
              <a href="/admin/photos" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors">
                Moderate photos →
              </a>
              <a href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-muted transition-colors">
                View marketplace →
              </a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Platform Info
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Platform fee</span>
                <span className="font-medium text-foreground">15%</span>
              </div>
              <div className="flex justify-between">
                <span>Seller share</span>
                <span className="font-medium text-foreground">85%</span>
              </div>
              <div className="flex justify-between">
                <span>Max upload size</span>
                <span className="font-medium text-foreground">50 MB</span>
              </div>
              <div className="flex justify-between">
                <span>Supported formats</span>
                <span className="font-medium text-foreground">JPG, PNG, WebP, HEIC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
