export const defaultLocalityNames = [
  "Adarsh Nagar",
  "Alwar",
  "Badanpura, Ring Road",
  "Badi Chopar",
  "Brihmpuri",
  "C Scheme",
  "Chhoti Chopar",
  "Dolai",
  "Durgapura",
  "Indira Gandhi Nagar",
  "JLN Marg",
  "Jagatpura II",
  "Malviya Industrial Area",
  "Malviya Nagar",
  "Manesar",
  "Mansarovar Extension",
  "Mansarover",
  "Model Town",
  "Moti Doongari",
  "Moti Nagar",
  "Nirmal Nagar",
  "Prahladpura",
  "Pratap Nagar",
  "Ptrakar Colony",
  "Raja Park",
  "Ranipura",
  "Ring Road",
  "Sanganer",
  "Sidhart Nagar",
  "Sitapura Industrial Area",
  "Sodala",
  "Sumer Nagar",
  "Vaishali Nagar",
  "Jawahar Nagar",
  "Tonk Road",
] as const;

export const defaultLocalities = defaultLocalityNames.map(
  (name, sortOrder) => ({
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    name,
    city: "Jaipur",
    state: "Rajasthan",
    summary: "",
    isFeatured: sortOrder < 8,
    isActive: true,
    sortOrder,
  }),
);

export const defaultFaqItems = [
  {
    key: "property-types",
    question: "What kinds of properties can I explore?",
    answer:
      "Browse the published homes, plots, and commercial listings currently available in the catalogue. Each listing includes its category and the details supplied for review.",
    sortOrder: 0,
    isPublished: true,
  },
  {
    key: "listing-review",
    question: "How does a property become visible on the site?",
    answer:
      "Owner submissions are reviewed by the team. Approval and public publication are separate steps, so only listings explicitly published by staff appear in the public catalogue.",
    sortOrder: 1,
    isPublished: true,
  },
  {
    key: "request-a-visit",
    question: "How do I ask about a listing or request a site visit?",
    answer:
      "Open the property page and send an enquiry with your preferred contact details. The team can follow up to discuss availability and arrange a visit.",
    sortOrder: 2,
    isPublished: true,
  },
  {
    key: "visit-request-meaning",
    question: "Does an enquiry reserve the property?",
    answer:
      "No. An enquiry or site-visit request starts a conversation; it does not reserve a property or confirm its availability.",
    sortOrder: 3,
    isPublished: true,
  },
  {
    key: "owner-submission",
    question: "Can I submit a property for review?",
    answer:
      "Yes. Create an account, add the property details and photos, then submit the listing for staff review from your account workspace.",
    sortOrder: 4,
    isPublished: true,
  },
] as const;
