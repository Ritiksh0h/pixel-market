"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutAction } from "@/lib/actions/purchases";
import { toast } from "@/components/ui/toaster";

interface CheckoutFormProps {
  photoId: string;
  licenseId: string;
}

export function CheckoutForm({ photoId, licenseId }: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition();

  function handlePurchase() {
    startTransition(async () => {
      const result = await createCheckoutAction(photoId, licenseId, "buy");
      if (result.error) toast.error(result.error);
      else if (result.url) window.location.href = result.url;
    });
  }

  return (
    <Button className="w-full" onClick={handlePurchase} loading={isPending}>
      Complete Purchase
    </Button>
  );
}
