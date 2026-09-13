/** Circles purpose chips — 5-second job at create. No wizard. */
export const CIRCLE_PURPOSES = [
  {
    id: "family",
    label: "Family pics",
    placeholder: "Family pics",
    empty: "Add the first photo",
  },
  {
    id: "team",
    label: "Team",
    placeholder: "Team chat",
    empty: "Team updates stay in this room — not the public feed.",
  },
  {
    id: "roommates",
    label: "Roommates",
    placeholder: "Apartment board",
    empty: "Chores, bills, and house notes — roommates only.",
  },
] as const;

export type CirclePurposeId = (typeof CIRCLE_PURPOSES)[number]["id"];

export function purposeMeta(id: string | null | undefined) {
  if (!id) return null;
  return CIRCLE_PURPOSES.find((p) => p.id === id) || null;
}

export function isCirclePurpose(id: string): id is CirclePurposeId {
  return CIRCLE_PURPOSES.some((p) => p.id === id);
}
