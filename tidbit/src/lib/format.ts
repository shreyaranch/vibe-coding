export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function placeLabel(p: { city: string; region: string; country: string }) {
  return [p.city, p.region || p.country].filter(Boolean).join(", ");
}

export const CONTENT_LABEL: Record<string, string> = {
  video: "Motion story",
  quick_read: "Quick read",
  explainer: "Explainer",
  infographic: "Data",
  breaking: "Breaking",
};

export const CLAIM_LABEL: Record<string, { label: string; tone: string }> = {
  reporting: { label: "Reporting", tone: "text-accent" },
  analysis: { label: "Analysis", tone: "text-sky-300" },
  opinion: { label: "Opinion", tone: "text-violet-300" },
  unconfirmed: { label: "Includes unconfirmed details", tone: "text-coral" },
};

/** Resize an image file to a square-ish JPEG data URL, small enough to store with the profile. */
export async function resizeImage(file: File, size = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That file isn't an image we can read."));
      i.src = url;
    });
    const scale = size / Math.min(img.width, img.height);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
