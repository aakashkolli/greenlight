/**
 * Generates a deterministic gradient for a project based on its ID.
 * Used as fallback when no imageUrl is provided.
 */
export function projectGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const h = Math.abs(hash) % 360;
  const h2 = (h + 150) % 360;
  return `linear-gradient(135deg, hsl(${h}, 60%, 40%), hsl(${h2}, 65%, 30%))`;
}

/**
 * Returns initials (up to 2 chars) from a project title.
 */
export function projectInitials(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
