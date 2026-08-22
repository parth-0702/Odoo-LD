import { useEffect } from "react";
import Lenis from "lenis";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Initialise Lenis once on the client and drive it from GSAP's ticker so
 * ScrollTrigger and smooth scrolling always use the same animation clock.
 */
export function useLenis() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Native scrolling is the least surprising and most accessible behaviour
    // when the user has requested reduced motion.
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    const handleScroll = () => ScrollTrigger.update();
    const handleTicker = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", handleScroll);
    gsap.ticker.add(handleTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(handleTicker);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
