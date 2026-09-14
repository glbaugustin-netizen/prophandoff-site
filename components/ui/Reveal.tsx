"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Délai en ms (pour cascader plusieurs éléments). */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/** Apparition douce (translate + fade) quand l'élément entre dans le viewport. */
export default function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={["reveal", className ?? ""].filter(Boolean).join(" ")}
      style={{ "--d": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
