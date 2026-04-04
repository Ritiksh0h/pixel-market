import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage({
  params,
}: {
  params: { photoId: string };
}) {
  return (
    <div className="container py-16 max-w-md mx-auto">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold">Purchase complete!</h1>
          <p className="text-muted-foreground">
            Your license has been activated. You can now download the full-resolution photo.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download photo
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">
                Continue browsing
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
