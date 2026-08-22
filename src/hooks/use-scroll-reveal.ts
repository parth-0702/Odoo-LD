import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ScrollRevealOptions {
  /** Direction the element slides in from. Default: "up" */
  direction?: "up" | "down" | "left" | "right";
  /** Pixels of travel. Default: 32 */
  distance?: number;
  /** Animation duration in seconds. Default: 0.8 */
  duration?: number;
  /** Delay before animation starts (seconds). Default: 0 */
  delay?: number;
  /** GSAP stagger when the ref contains multiple children. Default: 0 */
  stagger?: number;
  /** ScrollTrigger start position. Default: "top 88%" */
  start?: string;
}

/**
 * Attaches a scroll-triggered fade+slide reveal to the returned ref.
 * Uses GSAP ScrollTrigger. Kills cleanly on unmount.
 * Respects prefers-reduced-motion — reduced motion gives a simple fade only.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  const {
    direction = "up",
    distance = 32,
    duration = 0.8,
    delay = 0,
    stagger = 0,
    start = "top 88%",
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const d = reducedMotion ? 0 : distance;
    const dur = reducedMotion ? 0.4 : duration;

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      x: direction === "left" ? -d : direction === "right" ? d : 0,
      y: direction === "up" ? d : direction === "down" ? -d : 0,
    };

    const toVars: gsap.TweenVars = {
      opacity: 1,
      x: 0,
      y: 0,
      duration: dur,
      delay,
      ease: "power3.out",
    };

    // If stagger > 0, animate children; otherwise animate the element itself
    const targets = stagger > 0 ? el.children : el;

    const tween = gsap.fromTo(targets, fromVars, {
      ...toVars,
      stagger,
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
    });

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return ref;
}

/**
 * Simpler utility: kill all ScrollTriggers attached to an element tree.
 * Useful in effect cleanup.
 */
export function killScrollTriggers(triggers: ScrollTrigger[]) {
  triggers.forEach((t) => t.kill());
}
