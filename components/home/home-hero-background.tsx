"use client";

import { useSyncExternalStore } from "react";

import { motion, MotionConfig } from "motion/react";

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
  const motionEnabled = !useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const primaryMotion = motionEnabled
    ? { x: ["-3%", "4%", "-3%"], y: ["0%", "-3%", "0%"], scale: [1, 1.06, 1] }
    : { x: 0, y: 0, scale: 1 };
  const accentMotion = motionEnabled
    ? { x: ["2%", "-5%", "2%"], y: ["0%", "3%", "0%"], scale: [1, 1.1, 1] }
    : { x: 0, y: 0, scale: 1 };

  return (
    <MotionConfig reducedMotion="user">
      <div
        aria-hidden="true"
        className="home-hero__backdrop"
        data-hero-backdrop
        data-motion-enabled={motionEnabled ? "true" : "false"}
      >
        <div className="home-hero__grid" />
        <div className="home-hero__frame" />
        <motion.div
          animate={primaryMotion}
          className="home-hero__glow home-hero__glow--primary"
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          animate={accentMotion}
          className="home-hero__glow home-hero__glow--accent"
          transition={{ duration: 23, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
    </MotionConfig>
  );
}
