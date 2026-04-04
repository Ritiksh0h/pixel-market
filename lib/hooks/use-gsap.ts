"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Animate elements on scroll. Add `data-animate` to child elements.
 * Options: data-animate="fade-up" | "fade-in" | "slide-right" | "scale"
 */
export function useScrollAnimations(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current!.querySelectorAll("[data-animate]");

      elements.forEach((el) => {
        const type = el.getAttribute("data-animate") || "fade-up";
        const delay = parseFloat(el.getAttribute("data-delay") || "0");

        const from: gsap.TweenVars = { opacity: 0, duration: 0.7, delay, ease: "power2.out" };

        switch (type) {
          case "fade-up":
            from.y = 30;
            break;
          case "fade-in":
            break;
          case "slide-right":
            from.x = -30;
            break;
          case "scale":
            from.scale = 0.95;
            break;
        }

        gsap.from(el, {
          ...from,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
}

/**
 * Stagger animate a list of elements on scroll.
 */
export function useStaggerAnimation(
  containerRef: React.RefObject<HTMLElement>,
  selector: string = "[data-stagger]",
  stagger: number = 0.08
) {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(selector, {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, stagger]);
}

/**
 * Parallax effect on an element.
 */
export function useParallax(ref: React.RefObject<HTMLElement>, speed: number = 0.3) {
  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => window.innerHeight * speed * -1,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ref, speed]);
}
