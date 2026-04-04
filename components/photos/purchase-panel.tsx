"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckoutAction, placeBidAction } from "@/lib/actions/purchases";
import { toast } from "@/components/ui/toaster";
import { ShoppingCart, Clock, Gavel, DollarSign } from "lucide-react";
import Link from "next/link";

interface PurchasePanelProps {
  photo: {
    id: string;
    userId: string;
    forSale: boolean;
    salePrice: number | null;
    forRent: boolean;
    rentPriceMonthly: number | null;
    forAuction: boolean;
    auctionStartBid: number | null;
    auctionEndDate: Date | null;
    licenses: {
      id: string;
      name: string;
      description: string;
      price: number;
    }[];
  };
}

export function PurchasePanel({ photo }: PurchasePanelProps) {
  const { data: session } = useSession();
  const [selectedLicense, setSelectedLicense] = useState(photo.licenses[0]?.id || "");
  const [bidAmount, setBidAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const isOwner = session?.user?.id === photo.userId;
  const hasMonetization = photo.forSale || photo.forRent || photo.forAuction;

  if (!hasMonetization) return null;

  function handlePurchase(type: "buy" | "rent") {
    if (!session) {
      toast.error("Please sign in to purchase");
      return;
    }
    startTransition(async () => {
      const result = await createCheckoutAction(photo.id, selectedLicense, type);
      if (result.error) toast.error(result.error);
      else if (result.url) window.location.href = result.url;
    });
  }

  function handleBid() {
    if (!session) { toast.error("Please sign in to bid"); return; }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Enter a valid bid amount"); return; }
    startTransition(async () => {
      const result = await placeBidAction(photo.id, amount);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Bid placed!");
        setBidAmount("");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Purchase options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* License selection */}
        {photo.licenses.length > 0 && (photo.forSale || photo.forRent) && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">License</p>
            {photo.licenses.map((license) => (
              <label
                key={license.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedLicense === license.id
                    ? "border-foreground bg-secondary/50"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="license"
                    value={license.id}
                    checked={selectedLicense === license.id}
                    onChange={() => setSelectedLicense(license.id)}
                    className="sr-only"
                  />
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedLicense === license.id ? "border-foreground" : "border-muted-foreground"
                  }`}>
                    {selectedLicense === license.id && (
                      <div className="h-2 w-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{license.name}</p>
                    <p className="text-xs text-muted-foreground">{license.description}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">${license.price}</span>
              </label>
            ))}
          </div>
        )}

        {/* Buy button */}
        {photo.forSale && !isOwner && (
          <Button className="w-full" onClick={() => handlePurchase("buy")} loading={isPending}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy now
          </Button>
        )}

        {/* Rent button */}
        {photo.forRent && photo.rentPriceMonthly && !isOwner && (
          <Button variant="outline" className="w-full" onClick={() => handlePurchase("rent")} loading={isPending}>
            <Clock className="h-4 w-4 mr-2" />
            Rent — ${photo.rentPriceMonthly}/mo
          </Button>
        )}

        {/* Auction */}
        {photo.forAuction && !isOwner && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Auction</p>
              {photo.auctionEndDate && (
                <Badge variant="outline" className="text-xs">
                  Ends {new Date(photo.auctionEndDate).toLocaleDateString()}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min={photo.auctionStartBid || 1}
                  placeholder={`Min $${photo.auctionStartBid || 1}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                />
              </div>
              <Button onClick={handleBid} loading={isPending}>
                <Gavel className="h-4 w-4 mr-2" />
                Bid
              </Button>
            </div>
          </div>
        )}

        {isOwner && (
          <p className="text-xs text-center text-muted-foreground">
            This is your photo
          </p>
        )}

        {!session && (
          <p className="text-xs text-center text-muted-foreground">
            <Link href="/login" className="underline">Sign in</Link> to purchase
          </p>
        )}
      </CardContent>
    </Card>
  );
}
