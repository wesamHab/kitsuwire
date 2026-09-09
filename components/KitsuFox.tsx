import type { SVGProps } from "react";

type FoxProps = SVGProps<SVGSVGElement> & {
  mood?: "calm" | "happy" | "sleeping";
};

export function KitsuFox({ mood = "calm", ...props }: FoxProps) {
  const sleeping = mood === "sleeping";
  return (
    <svg viewBox="0 0 120 104" role="img" aria-label="KitsuWire fox" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
        <path fill="#fff" d="M20 36 24 7l24 18c8-4 17-5 25-2L96 6l4 34c7 7 11 16 11 27 0 21-22 34-51 34S9 88 9 67c0-12 4-22 11-31Z" />
        <path fill="#c9ff42" d="m27 17 4 19 13-10-17-9Zm65 0-5 22-12-14 17-8Z" strokeWidth="3.5" />
        <path fill="#c9ff42" d="M20 70c8 2 13 7 18 14-10-2-16-6-20-11l2-3Zm80-1c-7 2-13 7-17 14 9-2 15-6 19-11l-2-3Z" strokeWidth="3" />
        {sleeping ? <><path d="M42 57c4 4 9 4 13 0"/><path d="M67 57c4 4 9 4 13 0"/></> : <><path d="M43 57c3-4 8-4 11 0" /><path d="M68 57c3-4 8-4 11 0" /></>}
        <path fill="#111315" d="M57 67c2-2 5-2 7 0-1 4-2 5-4 5s-3-1-3-5Z" strokeWidth="3" />
        {mood === "happy" ? <path d="M49 77c7 8 16 8 23 0" /> : sleeping ? <path d="M55 79c3-2 7-2 10 0"/> : <path d="M54 78c4 3 8 3 12 0" />}
      </g>
    </svg>
  );
}

export function KitsuFoxExplorer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 360 300" role="img" aria-label="KitsuWire fox looking for the missing page" {...props}>
      <g fill="none" stroke="#0a0b0d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
        <g className="fox-tail">
          <path fill="#fff" d="M226 196c40-77 108-71 118-30 8 34-22 63-88 65-22 1-37-11-30-35Z" />
          <path fill="#c9ff42" d="M311 150c17 7 29 21 33 39-10-10-27-17-46-18l13-21Z" strokeWidth="5" />
        </g>
        <ellipse cx="180" cy="260" rx="103" ry="20" fill="#0a0b0d" opacity=".08" stroke="none" />
        <path fill="#fff" d="M133 173c-5 15-9 34-9 54 0 25 20 34 55 34 37 0 57-11 57-36 0-17-5-35-12-52l-91 0Z" />
        <path fill="#111315" d="M132 235c-13 0-23 9-23 20h35c4-8 2-15-12-20Zm93 0c13 0 23 9 23 20h-35c-4-8-2-15 12-20Z" />
        <path fill="#fff" d="M112 94 119 39l40 30c12-6 30-7 43-1l41-30 5 58c10 11 15 25 15 39 0 37-37 61-84 61-46 0-83-24-83-61 0-16 6-30 16-41Z" />
        <path fill="#c9ff42" d="m124 56 5 35 25-20-30-15Zm109 0-7 36-22-22 29-14Z" strokeWidth="5" />
        <path d="M144 124c8-9 18-9 26 0" />
        <path d="M194 124c8-9 18-9 26 0" />
        <path fill="#111315" d="M176 142c4-4 9-4 13 0-1 7-3 9-7 9s-6-2-6-9Z" strokeWidth="4" />
        <path d="M164 158c11 10 24 10 35 0" />
      </g>
      <g className="fox-question" fill="#c9ff42" fontFamily="Manrope, Arial, sans-serif" fontWeight="800">
        <text x="263" y="74" fontSize="58">?</text>
      </g>
    </svg>
  );
}
