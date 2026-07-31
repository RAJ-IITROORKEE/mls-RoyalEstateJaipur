import { PublicPage } from "@/components/layout/public-page";

export default function PrivacyPage() {
  return <PublicPage><section className="mx-auto max-w-[900px] px-5 py-20 sm:px-8 sm:py-28"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</p><h1 className="mt-4 font-serif text-5xl">Privacy notes</h1><div className="mt-10 grid gap-8 text-sm leading-8 text-muted-foreground"><p>This foundation collects account, property submission, enquiry, and technical information needed to operate the platform. Public listing data is separate from private owner documents.</p><p>Access to account and review data is limited by authenticated session and server-side role checks. Private document links should be short-lived and are not intended for public indexing.</p><p>Before launch, replace this foundation copy with the business&apos; approved privacy notice, retention schedule, controller details, and support contact.</p></div></section></PublicPage>;
}
