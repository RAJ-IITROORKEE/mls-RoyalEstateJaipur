"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const slides = [
  {
    src: "/home-carousal/01.jpg",
    alt: "Jal Mahal reflected in the water beneath the Aravalli hills",
    eyebrow: "Jal Mahal",
    title: "A slower view of Jaipur.",
    description: "Landmarks, neighbourhoods, and the details between them.",
  },
  {
    src: "/home-carousal/02.jpg",
    alt: "Close view of the ornate pink facade of Hawa Mahal",
    eyebrow: "Hawa Mahal",
    title: "A city made of detail.",
    description: "Look closer before you decide where the next move begins.",
  },
  {
    src: "/home-carousal/03.jpg",
    alt: "Hawa Mahal facade and surrounding Jaipur streets beneath a blue sky",
    eyebrow: "The Pink City",
    title: "Find your own frame.",
    description: "Explore Jaipur property with context that stays close to reality.",
  },
] as const;

export function HomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, reduceMotion]);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section
      aria-label="Jaipur landmark carousel"
      aria-roledescription="carousel"
      className="group relative min-h-[390px] overflow-hidden rounded-[2rem] bg-primary shadow-2xl sm:min-h-[500px]"
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setIsPaused(false);
        }
      }}
      onFocus={() => setIsPaused(true)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPrevious();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          showNext();
        }
        if (event.key === "Home") {
          event.preventDefault();
          setActiveIndex(0);
        }
        if (event.key === "End") {
          event.preventDefault();
          setActiveIndex(slides.length - 1);
        }
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={(event) => {
        const activeElement = document.activeElement;
        if (!activeElement || !event.currentTarget.contains(activeElement)) {
          setIsPaused(false);
        }
      }}
      role="region"
      tabIndex={0}
    >
      {slides.map((slide, index) => (
        <div
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
            index === activeIndex
              ? "scale-100 opacity-100"
              : "scale-[1.04] opacity-0"
          }`}
          key={slide.src}
        >
          <Image
            alt={index === activeIndex ? slide.alt : ""}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 55vw"
            src={slide.src}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-primary/35" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/45 via-transparent to-secondary/30" />

      <Button
        aria-label="Previous image"
        className="absolute left-4 top-1/2 z-10 !h-10 !min-h-10 !w-10 -translate-y-1/2 rounded-full border-white/25 bg-black/20 p-0 text-white backdrop-blur-md hover:bg-black/40 hover:text-white sm:left-6"
        onClick={showPrevious}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>

      <Button
        aria-label="Next image"
        className="absolute right-4 top-1/2 z-10 !h-10 !min-h-10 !w-10 -translate-y-1/2 rounded-full border-white/25 bg-black/20 p-0 text-white backdrop-blur-md hover:bg-black/40 hover:text-white sm:right-6"
        onClick={showNext}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>

      <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 text-white sm:inset-x-8 sm:top-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/75">
          Jaipur / Rajasthan
        </p>
        <span className="rounded-full border border-white/30 bg-black/15 px-3 py-1.5 text-xs font-semibold tabular-nums backdrop-blur-sm">
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      <div className="absolute right-5 top-20 max-w-48 rounded-2xl border border-white/35 bg-black/20 p-4 text-white backdrop-blur-md sm:right-8 sm:top-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
          The view
        </p>
        <p className="mt-2 font-serif text-2xl leading-tight">
          {activeSlide.title}
        </p>
      </div>

      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-4 text-white sm:inset-x-8 sm:bottom-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            {activeSlide.eyebrow}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">
            {activeSlide.description}
          </p>
        </div>

        <div
          aria-label="Carousel slides"
          className="flex shrink-0 self-end items-center gap-0.5"
          role="group"
        >
          {slides.map((slide, index) => (
            <Button
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={`Show ${slide.eyebrow}`}
              className="!h-8 !min-h-8 !w-8 rounded-full border-0 bg-transparent p-0 text-white hover:bg-white/15 hover:text-white"
              key={slide.src}
              onClick={() => setActiveIndex(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <span
                aria-hidden="true"
                className={`rounded-full bg-current transition-[width,height,background-color] motion-reduce:transition-none ${
                  index === activeIndex
                    ? "size-2 bg-accent"
                    : "size-1.5 bg-white/65"
                }`}
              />
            </Button>
          ))}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Showing {activeSlide.eyebrow}: {activeSlide.title}
      </span>
    </section>
  );
}
