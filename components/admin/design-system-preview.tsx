"use client";

import { useId, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronsUpDown,
  CircleAlert,
  Home,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { HomeHeroBackground } from "@/components/home/home-hero-background";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const previewLocalities = ["Adarsh Nagar", "Jagatpura", "Vaishali Nagar"];

export function DesignSystemPreview() {
  const localityId = useId();
  const listId = useId();
  const [intent, setIntent] = useState("buy");
  const [locality, setLocality] = useState("");
  const [isLocalityOpen, setIsLocalityOpen] = useState(false);
  const [notice, setNotice] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="home-hero relative isolate overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10">
        <HomeHeroBackground />
        <div className="relative flex max-w-2xl flex-col gap-4">
          <Badge variant="secondary">Design preview</Badge>
          <h1 className="hero-title-reveal text-4xl font-bold leading-[1.16] tracking-[-0.02em] sm:text-5xl">
            A clearer way to find your next place.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Review the shared interface in either theme. These sample controls
            do not change listings, accounts or application data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                setNotice(
                  "Preview action complete. No application data changed.",
                )
              }
            >
              <Search aria-hidden="true" data-icon="inline-start" />
              Explore properties
            </Button>
            <Button
              variant="outline"
              onClick={() => setNotice("Property action preview selected.")}
            >
              View property
              <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </Button>
            <Button disabled>
              <LoaderCircle aria-hidden="true" data-icon="inline-start" />
              Saving…
            </Button>
          </div>
          <p role="status" className="min-h-6 text-sm text-muted-foreground">
            {notice}
          </p>
        </div>
      </section>
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search and forms</CardTitle>
            <CardDescription>
              Visible labels, useful validation and keyboard selection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>I want to</FieldLegend>
                <ToggleGroup
                  type="single"
                  value={intent}
                  onValueChange={(value) => {
                    if (value) setIntent(value);
                  }}
                  aria-label="Property intent"
                  variant="outline"
                >
                  <ToggleGroupItem value="buy">Buy</ToggleGroupItem>
                  <ToggleGroupItem value="rent">Rent</ToggleGroupItem>
                </ToggleGroup>
              </FieldSet>
              <Field>
                <FieldLabel htmlFor="preview-search">
                  Search properties
                </FieldLabel>
                <Input
                  id="preview-search"
                  type="search"
                  placeholder="e.g. apartment in Jagatpura…"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={localityId}>Locality</FieldLabel>
                <Popover open={isLocalityOpen} onOpenChange={setIsLocalityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id={localityId}
                      variant="outline"
                      role="combobox"
                      aria-haspopup="dialog"
                      aria-controls={isLocalityOpen ? listId : undefined}
                      aria-expanded={isLocalityOpen}
                      aria-label={`Locality: ${locality || "All locations"}`}
                      className="w-full justify-between"
                    >
                      {locality || "All locations"}
                      <ChevronsUpDown
                        aria-hidden="true"
                        data-icon="inline-end"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    id={listId}
                    aria-label="Choose a locality"
                    className="w-(--radix-popover-trigger-width) p-0"
                  >
                    <Command>
                      <CommandInput
                        aria-label="Search localities"
                        placeholder="Search localities…"
                      />
                      <CommandList>
                        <CommandEmpty>No matching localities.</CommandEmpty>
                        <CommandGroup heading="Locations">
                          {["All locations", ...previewLocalities].map(
                            (name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={() => {
                                  setLocality(
                                    name === "All locations" ? "" : name,
                                  );
                                  setIsLocalityOpen(false);
                                }}
                              >
                                <Home aria-hidden="true" />
                                {name}
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <FieldLabel htmlFor="preview-type">Property type</FieldLabel>
                <NativeSelect id="preview-type" className="w-full">
                  <NativeSelectOption>All property types</NativeSelectOption>
                  <NativeSelectOption>Residential</NativeSelectOption>
                  <NativeSelectOption>Commercial</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="preview-email">Email</FieldLabel>
                <Input
                  id="preview-email"
                  type="email"
                  autoComplete="email"
                  defaultValue="invalid"
                  aria-invalid="true"
                  aria-describedby="preview-email-error"
                />
                <FieldError id="preview-email-error">
                  Enter an email address, such as name@example.com.
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="preview-message">Your question</FieldLabel>
                <Textarea
                  id="preview-message"
                  rows={3}
                  aria-describedby="preview-message-help"
                />
                <FieldDescription id="preview-message-help">
                  Tell us what you would like to confirm before a viewing.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary">
              <Check aria-hidden="true" />
              Sample form
            </Badge>
          </CardFooter>
        </Card>
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Details and overlays</CardTitle>
              <CardDescription>
                Focus stays inside overlays and returns to the trigger.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList aria-label="Property information">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="process">Process</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <p className="py-3 leading-6">
                    Compare the location, property details and asking price
                    before arranging a visit.
                  </p>
                </TabsContent>
                <TabsContent value="process">
                  <p className="py-3 leading-6">
                    Send an enquiry, confirm availability with the team and
                    arrange a suitable time to visit.
                  </p>
                </TabsContent>
              </Tabs>
              <Accordion type="single" collapsible>
                <AccordionItem value="visit">
                  <AccordionTrigger>
                    Does an enquiry reserve a property?
                  </AccordionTrigger>
                  <AccordionContent>
                    No. The team confirms current availability and discusses the
                    next step.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open details</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Property details preview</DialogTitle>
                      <DialogDescription>
                        This sample dialog changes no property data.
                      </DialogDescription>
                    </DialogHeader>
                    <p className="leading-7">
                      A longer description should wrap naturally and remain
                      readable at 200% zoom. Press Escape or Close to return to
                      the details button.
                    </p>
                  </DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <SlidersHorizontal
                        aria-hidden="true"
                        data-icon="inline-start"
                      />
                      Open filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filters preview</SheetTitle>
                      <SheetDescription>
                        Review mobile filter spacing without changing search
                        results.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="px-4">
                      <Field>
                        <FieldLabel htmlFor="preview-sheet-type">
                          Property type
                        </FieldLabel>
                        <NativeSelect
                          id="preview-sheet-type"
                          className="w-full"
                        >
                          <NativeSelectOption>
                            All property types
                          </NativeSelectOption>
                          <NativeSelectOption>Residential</NativeSelectOption>
                        </NativeSelect>
                      </Field>
                    </div>
                  </SheetContent>
                </Sheet>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 aria-hidden="true" data-icon="inline-start" />
                      Remove sample
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove the sample?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This demonstrates a confirmation only. No stored listing
                        or account will be removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep sample</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() =>
                          setNotice(
                            "Sample removal confirmed. No application data changed.",
                          )
                        }
                      >
                        Confirm preview
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Could not load the preview</AlertTitle>
            <AlertDescription>
              This is an example error. Your input is preserved; try the action
              again.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Loading and empty states</CardTitle>
              <CardDescription>
                Stable geometry and a useful next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                role="status"
                aria-label="Sample loading state"
                className="flex flex-col gap-3"
              >
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>No matching properties</EmptyTitle>
                  <EmptyDescription>
                    Try another locality or widen your filters.
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocality("");
                    setIntent("buy");
                    setNotice("Preview filters cleared.");
                  }}
                >
                  Clear filters
                </Button>
              </Empty>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Operational rows</CardTitle>
          <CardDescription>
            Sample statuses stay readable on small screens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              Preview records only; no business inventory.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Submission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="whitespace-normal">
                  Sample residential submission
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Draft</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => setNotice("Sample row selected.")}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
