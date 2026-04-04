import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { photos, licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Info } from "lucide-react";
import { CheckoutForm } from "@/components/photos/checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: { photoId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, params.photoId),
    with: {
      user: { columns: { id: true, name: true } },
      licenses: true,
    },
  });

  if (!photo) notFound();

  const defaultLicense = photo.licenses[0];
  const price = defaultLicense?.price || photo.salePrice || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="md:col-span-2 space-y-6">
              {/* Purchase Details */}
              <div className="border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">Purchase Details</h2>
                <div className="flex space-x-4">
                  <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{photo.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By {photo.user.name}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {defaultLicense?.name || "Standard License"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">License Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Commercial Use</h4>
                      <p className="text-sm text-muted-foreground">
                        Use in advertising, marketing materials, and commercial products
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Unlimited Duration</h4>
                      <p className="text-sm text-muted-foreground">No time limit on usage rights</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Multi-platform Usage</h4>
                      <p className="text-sm text-muted-foreground">Use across web, print, and social media</p>
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        This license does not include rights for resale of the image itself or use in templates sold to multiple customers.
                        <Link href="#" className="text-primary ml-1">View full license terms</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment — redirects to Stripe */}
              <div className="border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm">You&apos;ll be redirected to Stripe for secure payment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="space-y-6">
              <div className="border rounded-lg p-6 space-y-4 sticky top-24">
                <h2 className="text-xl font-semibold">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {defaultLicense?.name || "License"}
                    </span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span>$3.99</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(price + 3.99).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <CheckoutForm
                    photoId={photo.id}
                    licenseId={defaultLicense?.id || ""}
                  />
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    By completing this purchase, you agree to our
                    <Link href="#" className="text-primary mx-1">Terms of Service</Link>
                    and
                    <Link href="#" className="text-primary ml-1">License Agreement</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
