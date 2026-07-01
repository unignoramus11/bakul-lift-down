// SVG filter defs shared by every Stamp. Rendered once near the root. The
// turbulence + displacement gives the ink border and letters ragged, worn
// edges so a stamp never reads as a clean vector rectangle.
export function StampFilters() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter id="stamp-rough">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045 0.06"
            numOctaves={3}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        {/* Slightly finer displacement for small calendar thumbnails. */}
        <filter id="stamp-rough-sm">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.09 0.11"
            numOctaves={2}
            seed={4}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
