import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { CITIES, LISTING_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import type { City, ListingType, PropertyType } from "@/types";

const optionalIntString = z
  .string()
  .optional()
  .refine((v) => !v || /^\d+$/.test(v), "Must be a whole number");

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Please add a longer description"),
  listingType: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["CONDO", "APARTMENT", "HOUSE", "LAND"]),
  city: z.enum(["YANGON", "MANDALAY", "BAGO"]),
  township: z.string().optional(),
  address: z.string().optional(),
  priceMmk: z
    .string()
    .min(1, "Price is required")
    .refine((v) => /^\d+$/.test(v) && Number(v) > 0, "Enter a valid price"),
  bedrooms: optionalIntString,
  bathrooms: optionalIntString,
  areaSqft: optionalIntString,
});

type FormValues = z.infer<typeof schema>;

export default function NewListingPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      listingType: "SALE",
      propertyType: "CONDO",
      city: "YANGON",
    },
  });

  const createListing = useMutation({
    mutationFn: api.createListing,
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const listing = await createListing.mutateAsync({
        title: values.title,
        description: values.description,
        listingType: values.listingType as ListingType,
        propertyType: values.propertyType as PropertyType,
        city: values.city as City,
        township: values.township || undefined,
        address: values.address || undefined,
        priceMmk: Number(values.priceMmk),
        bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
        bathrooms: values.bathrooms ? Number(values.bathrooms) : undefined,
        areaSqft: values.areaSqft ? Number(values.areaSqft) : undefined,
      });

      if (photos.length > 0) {
        try {
          await api.uploadPhotos(listing.id, photos);
        } catch {
          toast.error("Listing created, but photo upload failed. You can add photos from My Listings.");
        }
      }

      toast.success("Listing posted!");
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Could not create listing. Please try again.",
      );
    }
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPhotos(files);
  }

  return (
    <div className="mx-auto max-w-2xl py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a listing</CardTitle>
          <CardDescription>Fill in the details of the property you want to list.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Spacious 2BR condo near Inya Lake" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Listing type</Label>
                <Select
                  items={LISTING_TYPES}
                  value={watch("listingType")}
                  onValueChange={(v) => setValue("listingType", v as ListingType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Property type</Label>
                <Select
                  items={PROPERTY_TYPES}
                  value={watch("propertyType")}
                  onValueChange={(v) => setValue("propertyType", v as PropertyType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>City</Label>
                <Select
                  items={CITIES}
                  value={watch("city")}
                  onValueChange={(v) => setValue("city", v as City)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="township">Township</Label>
                <Input id="township" {...register("township")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="priceMmk">Price (MMK)</Label>
                <Input id="priceMmk" type="number" min={0} {...register("priceMmk")} />
                {errors.priceMmk && (
                  <p className="text-sm text-destructive">{errors.priceMmk.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" type="number" min={0} {...register("bedrooms")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" type="number" min={0} {...register("bathrooms")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="areaSqft">Area (sqft)</Label>
                <Input id="areaSqft" type="number" min={0} {...register("areaSqft")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photos">Photos</Label>
              <Input id="photos" type="file" accept="image/*" multiple onChange={handlePhotoChange} />
              {photos.length > 0 && (
                <p className="text-sm text-muted-foreground">{photos.length} photo(s) selected</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
