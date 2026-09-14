"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

const links = [
  { href: "/addon/prop-handoff", label: "Addon" },
  { href: "/changelog", label: "Changelog" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // La pilule se resserre légèrement une fois qu'on a scrollé.
  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: scrolled ? 12 : 22,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "max-content",
        maxWidth: "calc(100% - 24px)",
        transition: "top .5s var(--ease-glass)",
      }}
    >
      <nav
        aria-label="Navigation principale"
        style={{
          display: "flex",
          alignItems: "center",
          gap: scrolled ? 18 : 26,
          padding: scrolled ? "8px 10px 8px 18px" : "11px 14px 11px 22px",
          borderRadius: 40,
          background: "rgba(255,255,255,.14)",
          border: "1px solid rgba(255,255,255,.35)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,.6), inset 0 -6px 14px rgba(255,255,255,.15), 0 10px 30px -10px rgba(0,0,0,.5)",
          WebkitBackdropFilter: "blur(6px) saturate(160%)",
          backdropFilter: "blur(6px) saturate(160%)",
          transition: "padding .5s var(--ease-glass), gap .5s var(--ease-glass)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "flex-start",
            gap: 6,
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-.01em",
            textShadow: "0 1px 8px rgba(0,0,0,.3)",
          }}
        >
          handoff
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--dot)",
              boxShadow: "0 0 10px var(--dot)",
              marginTop: 2,
            }}
          />
        </Link>

        <ul
          className="nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: 30,
                    color: active ? "var(--ink)" : "rgba(255,255,255,.85)",
                    background: active ? "rgba(255,255,255,.9)" : "transparent",
                    textShadow: active ? "none" : "0 1px 6px rgba(0,0,0,.25)",
                    transition: "background .35s var(--ease-out), color .35s var(--ease-out)",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {status === "loading" ? (
          <span style={{ width: 36, height: 36 }} aria-hidden="true" />
        ) : session?.user ? (
          <Link
            href="/dashboard"
            title={session.user.name ?? "Dashboard"}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                width={36}
                height={36}
                style={{
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,.5)",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,.6)",
                }}
              />
            ) : (
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.9)",
                  color: "var(--ink)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                }}
              >
                {(session.user.name ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void signIn("google")}>
            Sign in
          </button>
        )}
      </nav>
    </header>
  );
}
