"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCheckoutAction, placeBidAction } from "@/lib/actions/purchases";
import { toast } from "@/components/ui/toaster";
import {
  ShoppingCart, Clock, Gavel, DollarSign, Download,
  Check, Lock,
} from "lucide-react";
import Link from "next/link";

interface PurchasePanelProps {
  photo: {
    id: string;
    title: string;
    userId: string;
    originalUrl: string;
    forSale: boolean;
    salePrice: number | null;
    forRent: boolean;
    rentPriceMonthly: number | null;
    forAuction: boolean;
    auctionStartBid: number | null;
    auctionEndDate: Date | null;
    licenses: { id: string; name: string; description: string; price: number }[];
  };
  isOwner: boolean;
  isLoggedIn: boolean;
}

export function PurchasePanel({ photo, isOwner, isLoggedIn }: PurchasePanelProps) {
  const [selectedLicense, setSelectedLicense] = useState(photo.licenses[0]?.id || "");
  const [bidAmount, setBidAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const hasMonetization = photo.forSale || photo.forRent || photo.forAuction;
  const selectedLicenseData = photo.licenses.find((l) => l.id === selectedLicense);

  function handlePurchase(type: "buy" | "rent") {
    if (!isLoggedIn) { toast.error("Please sign in to purchase"); return; }
    startTransition(async () => {
      const result = await createCheckoutAction(photo.id, selectedLicense, type);
      if ("error" in result) toast.error(result.error as string);
      else if (result.url) window.location.href = result.url;
    });
  }

  function handleBid() {
    if (!isLoggedIn) { toast.error("Please sign in to bid"); return; }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Enter a valid bid amount"); return; }
    startTransition(async () => {
      const result = await placeBidAction(photo.id, amount);
      if ("error" in result) toast.error(result.error as string);
      else { toast.success("Bid placed!"); setBidAmount(""); }
    });
  }

  // ── OWNER: download only ──
  if (isOwner) {
    return (
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={photo.originalUrl} download={photo.title} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download original
          </a>
        </Button>
      </div>
    );
  }

  // ── FREE: no monetization ──
  if (!hasMonetization) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Download</h3>
          <Badge variant="success" className="text-[10px]">Free</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Free download — please credit the photographer.</p>
        {isLoggedIn ? (
          <Button size="sm" className="w-full" asChild>
            <a href={photo.originalUrl} download={photo.title} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download free
            </a>
          </Button>
        ) : (
          <>
            <Button size="sm" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Sign in to download
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              <Link href="/login" className="underline">Sign in</Link> to download
            </p>
          </>
        )}
      </div>
    );
  }

  // ── PAID: sale / rent / auction ──
  return (
    <div className="space-y-4">
      {/* License selector */}
      {photo.licenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">License</h3>
          {photo.licenses.map((license) => (
            <label
              key={license.id}
              className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors text-xs ${
                selectedLicense === license.id
                  ? "border-foreground bg-secondary/50"
                  : "border-border hover:border-foreground/30"
              }`}
              onClick={() => setSelectedLicense(license.id)}
            >
              <div className="flex items-center gap-2">
                <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                  selectedLicense === license.id ? "border-foreground" : "border-muted-foreground"
                }`}>
                  {selectedLicense === license.id && <div className="h-1.5 w-1.5 rounded-full bg-foreground" />}
                </div>
                <div>
                  <p className="font-medium">{license.name}</p>
                  <p className="text-muted-foreground">{license.description}</p>
                </div>
              </div>
              <span className="font-bold shrink-0 ml-2">${license.price}</span>
            </label>
          ))}
        </div>
      )}

      {/* Buy */}
      {photo.forSale && (
        <div className="space-y-2">
          {isLoggedIn && !isOwner ? (
            <Button size="sm" className="w-full" onClick={() => handlePurchase("buy")} loading={isPending}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy — ${selectedLicenseData?.price || photo.salePrice}
            </Button>
          ) : !isLoggedIn ? (
            <Button size="sm" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Sign in to buy
            </Button>
          ) : null}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-center">
            <Check className="h-3 w-3 text-emerald-500" />
            Instant download after purchase
          </div>
        </div>
      )}

      {/* Rent */}
      {photo.forRent && photo.rentPriceMonthly && (
        <div>
          {isLoggedIn && !isOwner ? (
            <Button variant="outline" size="sm" className="w-full" onClick={() => handlePurchase("rent")} loading={isPending}>
              <Clock className="h-4 w-4 mr-2" />
              Rent — ${photo.rentPriceMonthly}/mo
            </Button>
          ) : !isLoggedIn ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Sign in to rent
            </Button>
          ) : null}
        </div>
      )}

      {/* Auction */}
      {photo.forAuction && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Auction</h3>
            {photo.auctionEndDate && (
              <Badge variant="outline" className="text-[10px]">
                Ends {new Date(photo.auctionEndDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">Starting bid: ${photo.auctionStartBid || 1}</p>
          {isLoggedIn && !isOwner ? (
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="number" step="0.01" min={photo.auctionStartBid || 1}
                  placeholder={`$${photo.auctionStartBid || 1}`}
                  value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background pl-7 pr-2 text-sm"
                />
              </div>
              <Button size="sm" onClick={handleBid} loading={isPending}>
                <Gavel className="h-4 w-4 mr-1" />
                Bid
              </Button>
            </div>
          ) : !isLoggedIn ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Sign in to bid
            </Button>
          ) : null}
        </div>
      )}

      {/* Not logged in */}
      {!isLoggedIn && (
        <p className="text-[11px] text-center text-muted-foreground">
          <Link href="/login" className="underline">Sign in</Link> to purchase or download
        </p>
      )}
    </div>
  );
}
