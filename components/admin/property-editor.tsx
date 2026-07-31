"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  propertyCategories,
  propertyIntents,
} from "@/features/properties/domain";

type EditableProperty = {
  id: string;
  title: string;
  description: string;
  intent: string;
  category: string;
  otherPropertyType: string | null;
  priceRupees: string;
  priceOnRequest: boolean;
  isNegotiable: boolean;
  areaValue: string;
  areaUnit: string | null;
  addressLine: string | null;
  localityName: string;
  city: string;
  state: string;
  postalCode: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  furnishing: string | null;
  possession: string | null;
  amenities: string[];
  highlights: string[];
  seoTitle: string | null;
  seoDescription: string | null;
};

const fieldClass =
  "min-h-11 rounded-xl border border-border bg-background px-3 text-sm";
const labelClass =
  "grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground";

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PropertyEditor({ property }: { property: EditableProperty }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/properties/${property.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "details",
        title: formData.get("title"),
        description: formData.get("description"),
        intent: formData.get("intent"),
        category: formData.get("category"),
        otherPropertyType: formData.get("otherPropertyType"),
        priceRupees: String(formData.get("priceRupees") ?? "").replace(
          /[^\d]/g,
          "",
        ),
        priceOnRequest: formData.get("priceOnRequest") === "on",
        isNegotiable: formData.get("isNegotiable") === "on",
        areaValue: formData.get("areaValue"),
        areaUnit: formData.get("areaUnit"),
        addressLine: formData.get("addressLine"),
        localityName: formData.get("localityName"),
        city: formData.get("city"),
        state: formData.get("state"),
        postalCode: formData.get("postalCode"),
        bedrooms: formData.get("bedrooms"),
        bathrooms: formData.get("bathrooms"),
        floors: formData.get("floors"),
        furnishing: formData.get("furnishing"),
        possession: formData.get("possession"),
        amenities: lines(formData.get("amenities")),
        highlights: lines(formData.get("highlights")),
        seoTitle: formData.get("seoTitle"),
        seoDescription: formData.get("seoDescription"),
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(result?.error ?? "The property could not be saved.");
      return;
    }
    setMessage("Listing details saved.");
    router.refresh();
  }

  return (
    <form action={(formData) => void submit(formData)} className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Listing identity</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={`${labelClass} md:col-span-2`}>
            Title
            <input
              className={fieldClass}
              defaultValue={property.title}
              maxLength={180}
              name="title"
              required
            />
          </label>
          <label className={labelClass}>
            Intent
            <select
              className={fieldClass}
              defaultValue={property.intent}
              name="intent"
            >
              {propertyIntents.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Property type
            <select
              className={fieldClass}
              defaultValue={property.category}
              name="category"
            >
              {propertyCategories.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Other property type
            <input
              className={fieldClass}
              defaultValue={property.otherPropertyType ?? ""}
              maxLength={180}
              name="otherPropertyType"
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Description
            <textarea
              className="min-h-40 rounded-xl border border-border bg-background p-3 text-sm font-normal normal-case tracking-normal text-foreground"
              defaultValue={property.description}
              maxLength={10000}
              name="description"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Price and dimensions</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className={labelClass}>
            Price in rupees
            <input
              className={fieldClass}
              defaultValue={property.priceRupees}
              inputMode="numeric"
              name="priceRupees"
            />
          </label>
          <label className={labelClass}>
            Area
            <input
              className={fieldClass}
              defaultValue={property.areaValue}
              inputMode="decimal"
              name="areaValue"
            />
          </label>
          <label className={labelClass}>
            Area unit
            <input
              className={fieldClass}
              defaultValue={property.areaUnit ?? "SQ_FT"}
              maxLength={20}
              name="areaUnit"
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold">
            <input
              defaultChecked={property.priceOnRequest}
              name="priceOnRequest"
              type="checkbox"
            />
            Price on request
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold">
            <input
              defaultChecked={property.isNegotiable}
              name="isNegotiable"
              type="checkbox"
            />
            Negotiable
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Location and specifications</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className={`${labelClass} md:col-span-2 lg:col-span-3`}>
            Address line
            <input
              className={fieldClass}
              defaultValue={property.addressLine ?? ""}
              maxLength={500}
              name="addressLine"
            />
          </label>
          <label className={labelClass}>
            Locality
            <input
              className={fieldClass}
              defaultValue={property.localityName}
              maxLength={120}
              name="localityName"
              required
            />
          </label>
          <label className={labelClass}>
            City
            <input
              className={fieldClass}
              defaultValue={property.city}
              maxLength={80}
              name="city"
              required
            />
          </label>
          <label className={labelClass}>
            State
            <input
              className={fieldClass}
              defaultValue={property.state}
              maxLength={80}
              name="state"
              required
            />
          </label>
          <label className={labelClass}>
            Postal code
            <input
              className={fieldClass}
              defaultValue={property.postalCode ?? ""}
              inputMode="numeric"
              maxLength={6}
              name="postalCode"
            />
          </label>
          <label className={labelClass}>
            Bedrooms
            <input
              className={fieldClass}
              defaultValue={property.bedrooms ?? ""}
              inputMode="numeric"
              name="bedrooms"
            />
          </label>
          <label className={labelClass}>
            Bathrooms
            <input
              className={fieldClass}
              defaultValue={property.bathrooms ?? ""}
              inputMode="numeric"
              name="bathrooms"
            />
          </label>
          <label className={labelClass}>
            Floors
            <input
              className={fieldClass}
              defaultValue={property.floors ?? ""}
              inputMode="numeric"
              name="floors"
            />
          </label>
          <label className={labelClass}>
            Furnishing
            <input
              className={fieldClass}
              defaultValue={property.furnishing ?? ""}
              maxLength={40}
              name="furnishing"
            />
          </label>
          <label className={labelClass}>
            Possession
            <input
              className={fieldClass}
              defaultValue={property.possession ?? ""}
              maxLength={120}
              name="possession"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Highlights, amenities and SEO</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter one highlight or amenity per line.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Amenities
            <textarea
              className="min-h-32 rounded-xl border border-border bg-background p-3 text-sm font-normal normal-case tracking-normal text-foreground"
              defaultValue={property.amenities.join("\n")}
              name="amenities"
            />
          </label>
          <label className={labelClass}>
            Highlights
            <textarea
              className="min-h-32 rounded-xl border border-border bg-background p-3 text-sm font-normal normal-case tracking-normal text-foreground"
              defaultValue={property.highlights.join("\n")}
              name="highlights"
            />
          </label>
          <label className={labelClass}>
            SEO title
            <input
              className={fieldClass}
              defaultValue={property.seoTitle ?? ""}
              maxLength={180}
              name="seoTitle"
            />
          </label>
          <label className={labelClass}>
            SEO description
            <textarea
              className="min-h-24 rounded-xl border border-border bg-background p-3 text-sm font-normal normal-case tracking-normal text-foreground"
              defaultValue={property.seoDescription ?? ""}
              maxLength={320}
              name="seoDescription"
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {message || "Changes are audited when saved."}
        </p>
        <Button disabled={pending} type="submit">
          <Save aria-hidden="true" className="size-4" />
          {pending ? "Saving..." : "Save listing"}
        </Button>
      </div>
    </form>
  );
}
