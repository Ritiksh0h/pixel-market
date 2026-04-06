"use client";

import { Suspense, useState, useCallback, useRef, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { uploadPhotoAction, updatePhotoAction, getPhotoForEdit } from "@/lib/actions/photos";
import { toast } from "@/components/ui/toaster";
import { Camera, DollarSign, Tag, Info, Clock, Map, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function UploadPage() {
  return (
    <Suspense>
      <UploadContent />
    </Suspense>
  );
}

function UploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Edit mode state
  const [editData, setEditData] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(!!editSlug);

  // File state (only used for new uploads)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isEditMode = !!editSlug;

  // Fetch photo data when in edit mode
  useEffect(() => {
    if (editSlug) {
      setEditLoading(true);
      getPhotoForEdit(editSlug).then((data) => {
        if (data) {
          setEditData(data);
          setPreview(data.watermarkedUrl || data.thumbnailUrl);
        } else {
          toast.error("Photo not found or not authorized");
          router.push("/dashboard");
        }
        setEditLoading(false);
      });
    }
  }, [editSlug, router]);

  const isHeic = (f: File) =>
    f.type === "image/heic" || f.type === "image/heif" || /\.(heic|heif)$/i.test(f.name);

  const handleFile = useCallback(async (f: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(f.type) && !f.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
      toast.error("Only JPG, PNG, WebP, and HEIC files are allowed");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error("File must be under 50MB");
      return;
    }
    setFile(f);

    if (isHeic(f)) {
      setPreviewLoading(true);
      try {
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({ blob: f, toType: "image/jpeg", quality: 0.8 }) as Blob;
        setPreview(URL.createObjectURL(blob));
      } catch {
        setPreview(null);
      }
      setPreviewLoading(false);
    } else {
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isEditMode && editData) {
      // ── EDIT MODE ──
      const fd = new FormData(e.currentTarget);
      fd.append("photoId", editData.id);

      startTransition(async () => {
        const result = await updatePhotoAction(fd);
        if ("error" in result) toast.error(result.error as string);
        else {
          toast.success("Photo updated!");
          router.push(`/photos/${result.slug}`);
        }
      });
    } else {
      // ── CREATE MODE ──
      if (!file) { toast.error("Please select a photo"); return; }
      const fd = new FormData(e.currentTarget);
      fd.append("file", file);

      startTransition(async () => {
        const result = await uploadPhotoAction(fd);
        if ("error" in result) toast.error(result.error as string);
        else {
          toast.success("Photo uploaded!");
          router.push(`/photos/${result.slug}`);
        }
      });
    }
  }

  // Loading state for edit mode
  if (editLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading photo data...</span>
        </div>
      </div>
    );
  }

  // Extract current values for edit mode
  const d = editData;
  const currentTags = d?.tags?.map((pt: any) => pt.tag.name).join(", ") || "";

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            {isEditMode && (
              <Link href={`/photos/${editSlug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to photo
              </Link>
            )}
            <h1 className="text-3xl font-bold mb-6">
              {isEditMode ? "Edit Photo" : "Upload & Sell Your Photo"}
            </h1>

            {/* Image area */}
            <div className="border rounded-lg overflow-hidden mb-8">
              {isEditMode && preview ? (
                /* Edit mode — show existing photo */
                <div className="relative bg-muted">
                  <Image src={preview} alt="Current photo" width={800} height={500} className="w-full h-auto max-h-[400px] object-contain" />
                  <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/50 rounded px-2 py-1">
                    Editing — image cannot be changed
                  </div>
                </div>
              ) : !file ? (
                /* Create mode — dropzone */
                <div
                  className={`bg-muted p-8 flex flex-col items-center justify-center text-center cursor-pointer ${
                    isDragging ? "ring-2 ring-ring" : ""
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Drag & Drop your photo here</h3>
                  <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG, WebP, HEIC files up to 50MB</p>
                  <Button type="button">Browse Files</Button>
                </div>
              ) : previewLoading ? (
                <div className="bg-muted p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Converting HEIC preview...</p>
                </div>
              ) : preview ? (
                <div className="relative bg-muted">
                  <Image src={preview} alt="Preview" width={800} height={500} className="w-full h-auto max-h-[400px] object-contain" />
                  <button
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/50 rounded px-2 py-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </div>
                </div>
              ) : (
                <div className="relative bg-muted p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <Camera className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(1)} MB — Preview not available
                  </p>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Two-column: Photo Details + Camera Metadata */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Photo Details</h2>

                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">Title</label>
                  <input id="title" name="title" type="text" defaultValue={d?.title || ""} placeholder="Give your photo a descriptive title" className={inputClass} required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">Description</label>
                  <textarea id="description" name="description" rows={3} defaultValue={d?.description || ""} placeholder="Tell the story behind your photo" className={inputClass} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tags" className="block text-sm font-medium">Tags</label>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    <input id="tags" name="tags" type="text" defaultValue={currentTags} placeholder="Add tags (nature, landscape, portrait, etc.)" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="locationTaken" className="block text-sm font-medium">Location</label>
                  <div className="flex items-center">
                    <Map className="h-4 w-4 text-muted-foreground mr-2" />
                    <input id="locationTaken" name="locationTaken" type="text" defaultValue={d?.locationTaken || ""} placeholder="Where was this photo taken?" className={inputClass} />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="hide-location" name="hideLocation" value="true" defaultChecked={d?.hideLocation ?? false} className="mr-2" />
                    <label htmlFor="hide-location" className="text-xs text-muted-foreground">
                      Hide exact location for privacy
                    </label>
                  </div>
                </div>
              </div>

              {/* Camera Metadata */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Camera Metadata</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  {isEditMode ? "Extracted from your photo" : "This data will be automatically extracted from your photo"}
                </p>

                <div className="border rounded-md p-4 space-y-3">
                  {[
                    { icon: Camera, label: "Camera", value: d?.camera },
                    { icon: Info, label: "Lens", value: d?.lens },
                    { icon: Info, label: "ISO / Aperture", value: d?.iso && d?.aperture ? `${d.iso} · ${d.aperture}` : null },
                    { icon: Clock, label: "Shutter Speed", value: d?.shutterSpeed },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm">{item.value || "Auto-detected"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monetization Options */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Monetization Options</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="sell-direct" name="forSale" value="true" defaultChecked={d?.forSale ?? false} className="mt-1" />
                    <div>
                      <label htmlFor="sell-direct" className="font-medium text-sm">Sell Direct</label>
                      <p className="text-xs text-muted-foreground">Set a fixed price for your photo</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <input type="number" name="salePrice" step="0.01" min="0.50" defaultValue={d?.salePrice || ""} placeholder="Price" className={inputClass} />
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="rent-option" name="forRent" value="true" defaultChecked={d?.forRent ?? false} className="mt-1" />
                    <div>
                      <label htmlFor="rent-option" className="font-medium text-sm">Rent</label>
                      <p className="text-xs text-muted-foreground">Allow users to rent for a period</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <input type="number" name="rentPrice" step="0.01" min="0.50" defaultValue={d?.rentPriceMonthly || ""} placeholder="Monthly price" className={inputClass} />
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="auction" name="forAuction" value="true" defaultChecked={d?.forAuction ?? false} className="mt-1" />
                    <div>
                      <label htmlFor="auction" className="font-medium text-sm">Auction</label>
                      <p className="text-xs text-muted-foreground">Set a starting bid & duration</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <input type="number" name="auctionStartBid" step="0.01" min="0.50" defaultValue={d?.auctionStartBid || ""} placeholder="Starting bid" className={inputClass} />
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <select name="auctionDays" className={inputClass}>
                      <option value="3">3 days</option>
                      <option value="5">5 days</option>
                      <option value="7" selected>7 days</option>
                      <option value="14">14 days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              {isEditMode ? (
                <>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/photos/${editSlug}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" loading={isPending}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline">Save as Draft</Button>
                  <Button type="submit" loading={isPending} disabled={!file}>
                    Publish to Marketplace
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
