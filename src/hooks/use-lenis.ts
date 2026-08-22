import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Initialises Lenis smooth scroll globally.
 * Syncs Lenis RAF with GSAP's ScrollTrigger ticker so scroll-based
 * animations remain perfectly in sync.
 *
 * When prefers-reduced-motion is enabled, Lenis is still used but
 * with duration:0 so scroll positions remain accurate while heavy
 * transforms are disabled elsewhere.
 */
export function useLenis() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
      touchMultiplier: 1.8,
    });

    // Keep GSAP ScrollTrigger in sync with Lenis scroll position
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis using GSAP's ticker (single RAF loop)
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
}
