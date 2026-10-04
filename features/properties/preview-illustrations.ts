type PreviewIllustration = {
  publicUrl: string;
  altText: string;
  isIllustrative: true;
};

// Exact seed slugs only. Uploaded photos always take precedence in the public query.
// These files are illustrative stock photography, never evidence of a listing.
const illustrations: Readonly<Record<string, PreviewIllustration>> = {
  "preview-111-sq-yd-west-facing-plot-jagatpura": {
    publicUrl: "/images/illustrations/dry-land.webp",
    altText:
      "Illustrative stock photo of open dry land; not the listed property",
    isIllustrative: true,
  },
  "preview-169-sq-yd-plot-garden-city-jagatpura": {
    publicUrl: "/images/illustrations/open-field.webp",
    altText:
      "Illustrative stock photo of an open field; not the listed property",
    isIllustrative: true,
  },
  "preview-3-bhk-villa-rent-saligrampura": {
    publicUrl: "/images/illustrations/villa.webp",
    altText:
      "Illustrative stock photo of a modern home; not the listed property",
    isIllustrative: true,
  },
  "preview-627-sq-m-commercial-plot-ring-road": {
    publicUrl: "/images/illustrations/land-road.webp",
    altText:
      "Illustrative stock photo of land beside a road; not the listed property",
    isIllustrative: true,
  },
  "preview-333-sq-yd-commercial-plot-jagatpura": {
    publicUrl: "/images/illustrations/field-edge.webp",
    altText:
      "Illustrative stock photo of an open field edge; not the listed property",
    isIllustrative: true,
  },
};

export function getPreviewIllustration(
  slug: string,
): PreviewIllustration | null {
  return Object.hasOwn(illustrations, slug) ? illustrations[slug] : null;
}
