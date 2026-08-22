import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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
 * Attach a scroll-triggered fade-and-slide reveal to the returned ref.
 * All tweens and ScrollTriggers are scoped to the element and reverted on
 * unmount, which keeps route changes from leaking animation state.
 */
export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
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
    const element = ref.current;
    if (!element) return;

    const travel = reducedMotion ? 0 : distance;
    const context = gsap.context(() => {
      const fromVars: gsap.TweenVars = {
        opacity: 0,
        x: direction === "left" ? -travel : direction === "right" ? travel : 0,
        y: direction === "up" ? travel : direction === "down" ? -travel : 0,
      };
      const targets = stagger > 0 ? element.children : element;

      gsap.fromTo(targets, fromVars, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: reducedMotion ? 0.4 : duration,
        delay,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
        },
      });
    }, element);

    return () => context.revert();
  }, [delay, direction, distance, duration, reducedMotion, stagger, start]);

  return ref;
}

/** Kill a known collection of ScrollTriggers. */
export function killScrollTriggers(triggers: ScrollTrigger[]) {
  triggers.forEach((trigger) => trigger.kill());
}
