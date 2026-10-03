"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { useInView } from "motion/react";

import { ArchitecturalSpotlight } from "@/components/ui/architectural-spotlight";
import { Button } from "@/components/ui/button";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getMotionPreference() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerMotionPreference() {
  return true;
}

export function HomeHeroBackground() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const inView = useInView(backdropRef, { amount: 0.05 });
  const motionEnabled = !reducedMotion && !paused && inView;

  return (
    <>
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="home-hero__backdrop"
        data-hero-backdrop
        data-motion-enabled={motionEnabled ? "true" : "false"}
      >
        <div className="home-hero__grid" />
        <ArchitecturalSpotlight running={motionEnabled} />
      </div>
      {!reducedMotion ? (
        <Button
          variant="outline"
          size="small"
          className="absolute bottom-3 right-5 z-20 sm:right-8"
          aria-label={
            paused
              ? "Resume background animation"
              : "Pause background animation"
          }
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? (
            <Play aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Pause aria-hidden="true" data-icon="inline-start" />
          )}
          <span className="hidden sm:inline">
            {paused ? "Resume motion" : "Pause motion"}
          </span>
        </Button>
      ) : null}
    </>
  );
}
