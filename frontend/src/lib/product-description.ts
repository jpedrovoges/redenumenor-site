export function getDescriptionSegments(description: string) {
  return description
    .replace(/\r\n/g, "\n")
    .split(/\n+|•/)
    .map((segment) => segment.trim().replace(/^[-–•]+\s*/, ""))
    .filter(Boolean);
}