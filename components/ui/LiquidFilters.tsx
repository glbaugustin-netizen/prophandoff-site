/**
 * Filtres SVG de réfraction "liquid glass" (style board 3a).
 * Rendus une fois dans le layout ; référencés par `filter: url(#lg-liquid)`.
 */
export default function LiquidFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="lg-liquid" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.012"
          numOctaves="2"
          seed="7"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2.2" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="60"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="lg-liquid-fine" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.014 0.02"
          numOctaves="2"
          seed="14"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="38"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
