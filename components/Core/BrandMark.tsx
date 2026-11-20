import React, { useState } from 'react';

/**
 * LimeSheet script `ℓ` brand mark.
 *
 * The glyph is the approved mark: one continuous pen stroke rebuilt as 7
 * G2-continuous cubics (the path below is that exact geometry, unchanged).
 * It is inlined rather than loaded as an image so it takes `currentColor`,
 * stays crisp on any pixel grid, and can draw itself in CSS.
 *
 * Only the framing around the glyph is tuned for UI sizes: a tight viewBox
 * (the old 720 × 692 plate left ~30 % dead space) and a slightly heavier
 * stroke than the large cover artwork, because at 26 px a 26-unit stroke
 * lands under 1.2 px and turns grey.
 */

const PATH_LENGTH = 1489.56; // measured length of the 7 cubics
const VIEW_BOX = '118 51 484 590'; // glyph + stroke, evenly padded
const ASPECT = 484 / 590;

const GLYPH =
  'M137.87 609.17C303.35 480.93 468.84 352.69 570.13 166.61' +
  'C575.88 156.04 581.43 145.27 582.07 133.54' +
  'C583.02 116.11 573.12 96.54 562.89 84.94' +
  'C501.20 15.03 427.32 235.11 389.45 347.93' +
  'C377.44 383.69 369.06 408.67 361.22 443.70' +
  'C347.76 503.86 335.90 593.67 366.91 615.09' +
  'C392.67 632.90 448.02 603.48 503.38 574.07';

/* Class names are prefixed `lms-` so nothing collides with app styles. */
const CSS = `
.lms-mark{display:block;overflow:visible}
.lms-mark__path{
  fill:none;
  stroke:currentColor;
  stroke-width:34;
  stroke-linecap:round;
  stroke-linejoin:round;
  stroke-dasharray:var(--lms-len) calc(var(--lms-len) * 2);
  stroke-dashoffset:0;
}
.lms-mark--once .lms-mark__path{animation:lms-write 1.35s cubic-bezier(.65,0,.35,1) both}
.lms-mark--loop .lms-mark__path{animation:lms-write-loop 3.6s cubic-bezier(.65,0,.35,1) infinite}
@keyframes lms-write{
  from{stroke-dashoffset:var(--lms-len)}
  to{stroke-dashoffset:0}
}
/* draw in 0–1.35 s · hold to 2.05 s · retract to 3.05 s · rest to 3.6 s */
@keyframes lms-write-loop{
  0%{stroke-dashoffset:var(--lms-len)}
  37.5%{stroke-dashoffset:0}
  56.94%{stroke-dashoffset:0}
  84.72%{stroke-dashoffset:var(--lms-len)}
  100%{stroke-dashoffset:var(--lms-len)}
}
@media (prefers-reduced-motion:reduce){
  .lms-mark .lms-mark__path{animation:none !important;stroke-dashoffset:0}
}
`;

export interface BrandMarkProps {
  /** Height of the mark in px. Width follows the glyph's aspect ratio. */
  size?: number;
  /**
   * `once` draws in on mount and stays (default), `loop` runs the approved
   * 3.6 s draw / hold / retract / rest cycle, `none` renders the finished stroke.
   */
  animation?: 'once' | 'loop' | 'none';
  /** Replay the draw-in when the mark is hovered or focused. */
  replayOnHover?: boolean;
  /** Accessible name. Leave out where the wordmark already names the product. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 26,
  animation = 'once',
  replayOnHover = true,
  title,
  className,
  style,
}) => {
  const [pass, setPass] = useState(0);
  const animates = animation !== 'none';
  const variant = animation === 'loop' ? 'loop' : animation === 'once' ? 'once' : '';

  const replay = () => {
    if (animates && replayOnHover) setPass((p) => p + 1);
  };

  return (
    <svg
      className={['lms-mark', variant && `lms-mark--${variant}`, className].filter(Boolean).join(' ')}
      viewBox={VIEW_BOX}
      width={size * ASPECT}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      onPointerEnter={replay}
      style={{ height: size, width: size * ASPECT, ...style }}
    >
      {title ? <title>{title}</title> : null}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <path
        key={pass}
        className="lms-mark__path"
        d={GLYPH}
        style={{ ['--lms-len' as string]: PATH_LENGTH } as React.CSSProperties}
      />
    </svg>
  );
};
