"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Déconnexion côté client : contrairement à une action serveur, `signOut` de
 * next-auth/react prévient la session lue par la navbar (`useSession`) et les
 * autres onglets, donc l'avatar laisse place à « Se connecter ». Sans
 * rechargement : la navigation interne vers l'accueil laisse HeroSkip déposer
 * sous l'animation si elle a déjà été vue.
 */
export default function SignOutButton({ label }: { label: string }) {
  const router = useRouter();

  async function handleClick(): Promise<void> {
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleClick()}>
      {label}
    </button>
  );
}
