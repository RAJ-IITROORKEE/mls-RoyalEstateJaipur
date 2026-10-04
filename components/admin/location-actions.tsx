"use client";

import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { localityInputSchema } from "@/features/site-content/schemas";
import type { AdminLocation } from "@/features/site-content/location-table";

async function saveLocation(url: string, method: string, payload?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      result &&
        typeof result === "object" &&
        "error" in result &&
        typeof result.error === "string"
        ? result.error
        : "The change could not be saved. Try again.",
    );
}

export function LocationEditor({ locality }: { locality?: AdminLocation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = locality?.id || "new-location";

  useEffect(() => {
    if (!open) return;
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (dirty.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [open]);

  function changeOpen(next: boolean) {
    if (pending) return;
    if (!next && dirty.current) {
      setDiscardOpen(true);
      return;
    }
    setOpen(next);
    setError("");
    setErrors({});
    dirty.current = false;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const parsed = localityInputSchema.safeParse({
      name: form.get("name"),
      city: form.get("city"),
      state: form.get("state"),
      sortOrder: Number(form.get("sortOrder")),
      isFeatured: form.get("isFeatured") === "on",
      isActive: form.get("isActive") === "on",
    });
    setError("");
    setErrors({});
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        nextErrors[String(issue.path[0])] = issue.message;
      setErrors(nextErrors);
      const first = formRef.current?.elements.namedItem(
        String(parsed.error.issues[0]?.path[0]),
      );
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setPending(true);
    try {
      await saveLocation(
        locality
          ? `/api/admin/localities/${locality.id}`
          : "/api/admin/localities",
        locality ? "PATCH" : "POST",
        parsed.data,
      );
      dirty.current = false;
      setOpen(false);
      toast.success(locality ? "Location updated." : "Location added.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The change could not be saved. Try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild>
          <Button
            variant={locality ? "outline" : "default"}
            aria-label={locality ? `Edit ${locality.name}` : undefined}
          >
            {locality ? (
              <Pencil aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Plus aria-hidden="true" data-icon="inline-start" />
            )}
            {locality ? "Edit" : "Add location"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locality ? "Edit location" : "Add location"}
            </DialogTitle>
            <DialogDescription>
              Active locations appear in property search. Changes are recorded
              in audit history.
            </DialogDescription>
          </DialogHeader>
          <form
            ref={formRef}
            onSubmit={submit}
            onChange={() => {
              dirty.current = true;
            }}
          >
            <fieldset disabled={pending} className="min-w-0">
              <FieldGroup>
                {(
                  [
                    {
                      name: "name",
                      label: "Location name",
                      value: locality?.name || "",
                      max: 100,
                    },
                    {
                      name: "city",
                      label: "City",
                      value: locality?.city || "Jaipur",
                      max: 80,
                    },
                    {
                      name: "state",
                      label: "State",
                      value: locality?.state || "Rajasthan",
                      max: 80,
                    },
                  ] as const
                ).map((field) => (
                  <Field
                    key={field.name}
                    data-invalid={Boolean(errors[field.name])}
                  >
                    <FieldLabel htmlFor={`${prefix}-${field.name}`}>
                      {field.label}
                    </FieldLabel>
                    <Input
                      id={`${prefix}-${field.name}`}
                      name={field.name}
                      autoComplete="off"
                      defaultValue={field.value}
                      minLength={2}
                      maxLength={field.max}
                      required
                      aria-invalid={Boolean(errors[field.name])}
                      aria-describedby={
                        errors[field.name]
                          ? `${prefix}-${field.name}-error`
                          : undefined
                      }
                    />
                    <FieldError id={`${prefix}-${field.name}-error`}>
                      {errors[field.name]}
                    </FieldError>
                  </Field>
                ))}
                <Field data-invalid={Boolean(errors.sortOrder)}>
                  <FieldLabel htmlFor={`${prefix}-order`}>
                    Display order
                  </FieldLabel>
                  <Input
                    id={`${prefix}-order`}
                    name="sortOrder"
                    autoComplete="off"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={10000}
                    defaultValue={locality?.sortOrder || 0}
                    required
                    aria-invalid={Boolean(errors.sortOrder)}
                    aria-describedby={
                      errors.sortOrder ? `${prefix}-order-error` : undefined
                    }
                  />
                  <FieldError id={`${prefix}-order-error`}>
                    {errors.sortOrder}
                  </FieldError>
                </Field>
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input
                    className="size-4 accent-primary"
                    type="checkbox"
                    name="isActive"
                    defaultChecked={locality?.isActive ?? true}
                  />
                  Active in property search
                </label>
                <label className="flex min-h-11 items-center gap-3 text-sm">
                  <input
                    className="size-4 accent-primary"
                    type="checkbox"
                    name="isFeatured"
                    defaultChecked={locality?.isFeatured ?? false}
                  />
                  Feature on homepage
                </label>
              </FieldGroup>
            </fieldset>
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => changeOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && (
                  <LoaderCircle
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="motion-safe:animate-spin"
                  />
                )}
                {pending ? "Saving…" : "Save location"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your changes to this location have not been saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                dirty.current = false;
                setOpen(false);
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function LocationDelete({ locality }: { locality: AdminLocation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function remove(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await saveLocation(`/api/admin/localities/${locality.id}`, "DELETE");
      setOpen(false);
      toast.success("Location deleted.");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The location could not be deleted. Try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next);
          setError("");
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" aria-label={`Delete ${locality.name}`}>
          <Trash2 aria-hidden="true" data-icon="inline-start" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {locality.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {locality.propertyCount
              ? "This location is linked to properties and cannot be deleted. Edit it and turn off Active in property search to hide it."
              : "This permanently removes the location from Settings and property search. The deletion is recorded in audit history."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending || locality.propertyCount > 0}
            onClick={remove}
          >
            {pending ? "Deleting…" : "Delete location"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
