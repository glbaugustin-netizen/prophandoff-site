"use client";

import { signOut } from "next-auth/react";

/**
 * Déconnexion côté client : contrairement à une action serveur, `signOut` de
 * next-auth/react prévient la session lue par la navbar (`useSession`), et les
 * autres onglets, puis recharge la page : l'avatar laisse place à « Se connecter ».
 */
export default function SignOutButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => void signOut({ redirectTo: "/" })}
    >
      {label}
    </button>
  );
}
