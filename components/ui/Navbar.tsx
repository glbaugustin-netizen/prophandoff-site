"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession, signIn } from "next-auth/react";
import { useLang } from "@/components/LanguageProvider";
import LangToggle from "./LangToggle";
import type { Dictionary } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/*  Icônes (monochromes, trait 1.8)                                    */
/* ------------------------------------------------------------------ */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const Icons = {
  home: (
    <svg {...iconProps}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
  addon: (
    <svg {...iconProps}>
      <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
      <path d="M3.5 7.5V16.5L12 21l8.5-4.5v-9" />
      <path d="M12 12v9" />
    </svg>
  ),
  guides: (
    <svg {...iconProps}>
      <path d="M12 7.5C10.5 6 8.5 5.5 4.5 5.5v12c4 0 6 .5 7.5 2 1.5-1.5 3.5-2 7.5-2v-12c-4 0-6 .5-7.5 2Z" />
      <path d="M12 7.5v12" />
    </svg>
  ),
  changelog: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  dashboard: (
    <svg {...iconProps}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  ),
  user: (
    <svg {...iconProps}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
} satisfies Record<string, ReactNode>;

/* Marque : le marteau du logo PH, relevé au pixel sur le logo source (tête
   696 × 455, manche de 126 de large). Plein, et non au trait comme les icônes. */
const BrandMark = (
  <svg className="navx-brand-mark" viewBox="0 0 696 1005" aria-hidden="true">
    <path d="M0 0H135L285 98H411L561 0H696V455H561L411 339V1005H285V339L135 455H0Z" />
  </svg>
);

interface NavItem {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: ReactNode;
}

const ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: Icons.home },
  { href: "/addon/prop-handoff", labelKey: "addon", icon: Icons.addon },
  { href: "/guides", labelKey: "guides", icon: Icons.guides },
  { href: "/changelog", labelKey: "changelog", icon: Icons.changelog },
  { href: "/dashboard", labelKey: "dashboard", icon: Icons.dashboard },
];

const isActivePath = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const { data: session, status } = useSession();
  const { t } = useLang();
  const pathname = usePathname();

  // Sélection "optimiste" au clic, puis alignée sur la route réelle.
  const routeActive = ITEMS.find((it) => isActivePath(pathname, it.href))?.href ?? null;
  const [active, setActive] = useState<string | null>(routeActive);
  useEffect(() => setActive(routeActive), [routeActive]);

  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [bubble, setBubble] = useState<{ x: number; w: number; visible: boolean }>({
    x: 0,
    w: 0,
    visible: false,
  });

  // La bulle se cale sur l'élément sélectionné (mesure DOM → transform/width).
  const measure = useCallback((): void => {
    const list = listRef.current;
    const el = active ? itemRefs.current.get(active) : undefined;
    if (!list || !el) {
      setBubble((b) => ({ ...b, visible: false }));
      return;
    }
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setBubble({ x: er.left - lr.left, w: er.width, visible: true });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Le libellé se déploie en ~.5 s et les polices arrivent après coup : un
  // ResizeObserver sur les éléments garde la bulle collée à leur largeur réelle.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    itemRefs.current.forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <header className="navx">
      <nav className="navx-pill" aria-label="Navigation principale">
        <Link href="/" className="navx-brand" onClick={() => setActive("/")}>
          handoff
          {BrandMark}
        </Link>

        <ul className="navx-list" ref={listRef}>
          {/* bloc or qui glisse sous l'élément sélectionné */}
          <li
            aria-hidden="true"
            className={`navx-bubble${bubble.visible ? " is-visible" : ""}`}
            style={{ transform: `translateX(${bubble.x}px)`, width: bubble.w }}
          >
            <span className="navx-drop" />
          </li>
          {ITEMS.map((it) => {
            const on = active === it.href;
            const label = t.nav[it.labelKey];
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  ref={(node) => {
                    if (node) itemRefs.current.set(it.href, node);
                    else itemRefs.current.delete(it.href);
                  }}
                  className={`navx-item${on ? " is-active" : ""}`}
                  aria-label={label}
                  aria-current={on ? "page" : undefined}
                  title={label}
                  onClick={() => setActive(it.href)}
                >
                  <span className="navx-icon">{it.icon}</span>
                  <span className="navx-label">
                    <span>{label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <LangToggle />

        {status === "loading" ? (
          <span className="navx-avatar" aria-hidden="true" />
        ) : session?.user ? (
          <Link
            href="/dashboard"
            className="navx-avatar"
            title={session.user.name ?? "Dashboard"}
            onClick={() => setActive("/dashboard")}
          >
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" width={36} height={36} />
            ) : (
              <span>{(session.user.name ?? "?").charAt(0).toUpperCase()}</span>
            )}
          </Link>
        ) : (
          <button
            type="button"
            className="navx-signin"
            onClick={() => void signIn("google")}
            aria-label={t.nav.signInAria}
            title={t.nav.signInAria}
          >
            <span className="navx-icon">{Icons.user}</span>
            <span className="navx-signin-label">{t.nav.signIn}</span>
          </button>
        )}
      </nav>
    </header>
  );
}
