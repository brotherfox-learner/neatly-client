/**
 * Legacy paths from LandingRooms (`/rooms/:slug`) → `room_types.id` in Supabase.
 * Keep in sync with seed UUIDs in `neatly-server/supabase-seed-mock.sql`.
 */
export const ROOM_TYPE_SLUG_TO_ID: Record<string, string> = {
  "superior-garden-view": "c0000001-0000-0000-0000-000000000001",
  deluxe: "c0000001-0000-0000-0000-000000000002",
  superior: "c0000001-0000-0000-0000-000000000003",
  "premier-sea-view": "c0000001-0000-0000-0000-000000000004",
  supreme: "c0000001-0000-0000-0000-000000000005",
  suite: "c0000001-0000-0000-0000-000000000006",
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function resolveRoomTypeIdParam(param: string): string {
  const trimmed = param.trim()
  if (UUID_RE.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  return ROOM_TYPE_SLUG_TO_ID[trimmed] ?? trimmed
}
