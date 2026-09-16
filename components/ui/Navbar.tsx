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

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: Icons.home },
  { href: "/addon/prop-handoff", label: "Addon", icon: Icons.addon },
  { href: "/changelog", label: "Changelog", icon: Icons.changelog },
  { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
];

const isActivePath = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navx${scrolled ? " is-scrolled" : ""}`}>
      <nav className="navx-pill" aria-label="Navigation principale">
        <Link href="/" className="navx-brand" onClick={() => setActive("/")}>
          handoff
          <span className="navx-brand-dot" aria-hidden="true" />
        </Link>

        <ul className="navx-list" ref={listRef}>
          {/* bulle liquid glass qui glisse sous l'élément sélectionné */}
          <li
            aria-hidden="true"
            className={`navx-bubble${bubble.visible ? " is-visible" : ""}`}
            style={{ transform: `translateX(${bubble.x}px)`, width: bubble.w }}
          />
          {ITEMS.map((it) => {
            const on = active === it.href;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  ref={(node) => {
                    if (node) itemRefs.current.set(it.href, node);
                    else itemRefs.current.delete(it.href);
                  }}
                  className={`navx-item${on ? " is-active" : ""}`}
                  aria-label={it.label}
                  aria-current={on ? "page" : undefined}
                  title={it.label}
                  onClick={() => setActive(it.href)}
                >
                  <span className="navx-icon">{it.icon}</span>
                  <span className="navx-label">
                    <span>{it.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

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
              <img src={session.user.image} alt="" width={34} height={34} />
            ) : (
              <span>{(session.user.name ?? "?").charAt(0).toUpperCase()}</span>
            )}
          </Link>
        ) : (
          <button
            type="button"
            className="navx-signin"
            onClick={() => void signIn("google")}
            aria-label="Se connecter"
            title="Se connecter"
          >
            <span className="navx-icon">{Icons.user}</span>
            <span className="navx-signin-label">Sign in</span>
          </button>
        )}
      </nav>
    </header>
  );
}
