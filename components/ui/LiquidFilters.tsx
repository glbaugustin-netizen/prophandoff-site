/**
 * Filtre SVG « Liquid Glass » (iOS 26) : le verre ne floute pas le fond,
 * il le déforme. Injecté une seule fois dans le layout racine, référencé par
 * `backdrop-filter: … url(#liquid)`.
 *
 * `scale` = intensité de la déformation (30–45 est la bonne plage ; au-delà
 * de 60 ça devient caricatural). Le feGaussianBlur lisse le bruit, pas l'image.
 */
export const LIQUID_SCALE = 34;

export default function LiquidFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="liquid"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.013"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feGaussianBlur in="n" stdDeviation="0.8" result="nb" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="nb"
            scale={LIQUID_SCALE}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
