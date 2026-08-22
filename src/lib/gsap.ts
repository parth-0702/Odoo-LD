import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once at module level
gsap.registerPlugin(ScrollTrigger);

// Default ease used throughout the design system
gsap.defaults({ ease: "power3.out" });

export { gsap, ScrollTrigger };
