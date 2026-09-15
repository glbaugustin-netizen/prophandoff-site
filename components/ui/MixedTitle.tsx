import type { CSSProperties } from "react";

/**
 * Titre mixte Fira Sans + Mea Culpa.
 *
 * Les mots entre `*…*` passent en manuscrit (classe `.script`) :
 *   <MixedTitle text="Passez un objet *en une seconde*" />
 *
 * Règles : 2-3 mots manuscrits max par titre, uniquement des mots qui portent
 * le sens, jamais dans le corps de texte.
 */
interface MixedTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
}

export function MixedTitle({ text, as: Tag = "h2", className, style }: MixedTitleProps) {
  // split avec groupe capturant : les index impairs sont les segments entre * *
  const parts = text.split(/\*([^*]+)\*/);

  return (
    <Tag className={className} style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="script">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </Tag>
  );
}

export default MixedTitle;
