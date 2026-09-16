"use client";

import { useEffect } from "react";
import { HERO_DONE_KEY, HERO_SECTION_ID } from "./ScrollAnimation";

/**
 * Quand on revient sur l'accueil après avoir déjà scrollé l'animation jusqu'au
 * bout (flag posé par ScrollAnimation), on se positionne directement sous le
 * hero au lieu de tout rescroller.
 *
 * Ne s'applique qu'aux navigations internes : un chargement direct ou un
 * rechargement (document jeune) montre toujours l'animation.
 */
export default function HeroSkip() {
  useEffect(() => {
    let done = false;
    try {
      done = window.sessionStorage.getItem(HERO_DONE_KEY) === "1";
    } catch {
      return;
    }
    if (!done) return;
    if (performance.now() < 3000) return; // chargement / rechargement de page
    if (window.location.hash) return; // ancre explicite : on la respecte

    const hero = document.getElementById(HERO_SECTION_ID);
    if (!hero) return;
    window.scrollTo({ top: hero.offsetTop + hero.offsetHeight, behavior: "instant" });
  }, []);

  return null;
}
