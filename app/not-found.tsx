import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">404</p><h1 className="mt-4 font-serif text-5xl">That room is not on the plan.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">The page you requested is unavailable or has moved.</p><Link className="mt-8 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" href="/">Return home</Link></main>;
}
