"use client";

import { useState, useEffect, useTransition } from "react";
import { getAdminUsers, adminDeleteUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { Search, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { getInitials, timeAgo } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  isPremium: boolean;
  createdAt: Date;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  function load(p: number, q: string) {
    setLoading(true);
    getAdminUsers(p, 20, q || undefined).then((data) => {
      setUsers(data.users as User[]);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setLoading(false);
    });
  }

  useEffect(() => { load(1, ""); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(1, search);
  }

  function handleDelete(userId: string, name: string) {
    if (!confirm(`Delete user "${name || userId}"? This removes ALL their data permanently.`)) return;
    startTransition(async () => {
      const result = await adminDeleteUser(userId);
      if ("error" in result) toast.error(result.error as string);
      else {
        toast.success("User deleted");
        load(page, search);
      }
    });
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, username..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No users found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name || "No name"}</p>
                        {user.isPremium && <Badge className="text-[10px]">Premium</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username || "no-username"} · Joined {timeAgo(new Date(user.createdAt))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(user.id, user.name || user.email)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => load(page - 1, search)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => load(page + 1, search)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
