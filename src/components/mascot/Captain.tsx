type Pose = "welcome" | "think" | "surprised" | "celebrate" | "sad" | "wink";

const colors = [
  "#14B8C4",
  "#FF6B5B",
  "#FFD23F",
  "#80CC87",
  "#B5A5E2",
  "#72B9E8",
  "#FFB4C0",
  "#E8A66C",
  "#B7D76C",
  "#80D5C4",
  "#E9CBFF",
  "#BEC9D5",
];

const poseLabel: Record<Pose, string> = {
  welcome: "powitanie",
  think: "myśli",
  surprised: "zaskoczenie",
  celebrate: "świętuje",
  sad: "smutny",
  wink: "mruga",
};

export function FishArt({
  i = 0,
  pose = "welcome",
  mascot = false,
}: {
  i?: number;
  pose?: Pose;
  mascot?: boolean;
}) {
  const color = mascot ? "#77BA62" : (colors[i % 12] ?? colors[0]);
  const sad = pose === "sad";
  const wink = pose === "wink";
  const label = mascot ? "Kapitan Szczupak" : `Komiksowy awatar ${i + 1}`;

  return (
    <svg
      className="fish-svg"
      viewBox="0 0 220 145"
      role="img"
      aria-label={`${label} · ${poseLabel[pose]}`}
    >
      <g stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m59 70-41-27 2 65 39-18" fill={color} />
        <path d="m89 46 14-25 32 27M92 108l16 22 21-22" fill={mascot ? "#FFD23F" : color} />
        <path d="M42 79C52 35 128 30 171 57l31 23-31 27C121 128 54 120 42 79Z" fill={color} />
        <path d="m112 89-19 17 33-4" fill="#FFF4DC" />
        <path d="M145 55q-10 26 0 48" fill="none" />
        <circle cx="166" cy="69" r="17" fill="#FFF4DC" />
        {wink ? <path d="m156 70 12-4 7 5" /> : <circle cx="170" cy="70" r="5" fill="#111" />}
        {pose === "surprised" ? (
          <ellipse cx="187" cy="91" rx="6" ry="9" fill="#111" />
        ) : (
          <path d={`M172 ${sad ? 98 : 88}q13 ${sad ? -15 : 15} 24 0`} fill="none" />
        )}
        {mascot ? <path d="M180 88q-15-10-21 0 8 9 21 0 10 12 23 2" fill="#111" /> : null}
        {mascot ? (
          <>
            <path d="M70 42 77 16 132 16 145 44Z" fill="#0B1F3A" />
            <path d="M65 42h88" />
            <path d="m104 24 4 9 4-9" stroke="#FFD23F" />
          </>
        ) : null}
        {pose === "think" ? <path d="m188 110 14 12-5-18" fill="#77BA62" /> : null}
        {pose === "celebrate" ? (
          <path d="m17 21 4-10 4 10 11 4-11 4-4 10-4-10-10-4Z" fill="#FFD23F" />
        ) : null}
        {sad ? <path d="M172 43q-12-26-15-9 0 11 15 9" fill="#72B9E8" /> : null}
      </g>
    </svg>
  );
}

export function Captain() {
  return <FishArt pose="wink" mascot />;
}
