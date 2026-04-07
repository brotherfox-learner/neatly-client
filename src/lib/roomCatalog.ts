import type { SupabaseClient } from "@supabase/supabase-js"

import type { Room } from "@/data/rooms"
import { resolveRoomTypeIdParam } from "@/data/roomTypeSlugs"

export interface SearchResultRoom {
  id: string
  name: string
  description: string
  coverImage: string
  /** max_occupancy for this room type */
  guests: number
  bedLabel: string
  sqm: number
  originalPrice: number
  currentPrice: number
  /**
   * Vacant physical rooms for the selected stay; set only when &lt; 3 so the UI can warn scarcity.
   */
  roomsLeft?: number
}

function parseLocalYmd(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
}

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Each calendar night of the stay: [checkIn, checkOut) */
export function stayNightDatesIso(checkIn: string, checkOut: string): string[] {
  const nights: string[] = []
  const start = parseLocalYmd(checkIn)
  const end = parseLocalYmd(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return nights
  }
  const cur = new Date(start)
  while (cur < end) {
    nights.push(formatLocalYmd(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return nights
}

function parseSqmFromDescription(description: string | null): number {
  if (!description) return 0
  const m = description.match(/(\d+)\s*sqm/i)
  return m?.[1] ? Number.parseInt(m[1], 10) : 0
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === "string")
}

function sortImages(
  rows: { image_url: string; is_primary: boolean | null; sort_order: number | null }[],
): string[] {
  const sorted = [...rows].sort((a, b) => {
    const pa = a.is_primary ? 0 : 1
    const pb = b.is_primary ? 0 : 1
    if (pa !== pb) return pa - pb
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })
  return sorted.map((r) => r.image_url).filter(Boolean)
}

function priceNumber(v: unknown): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === "number" ? v : Number.parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

function normalizePgDate(d: string): string {
  return d.length >= 10 ? d.slice(0, 10) : d
}

/** Bookings in these states do not hold inventory. */
const NON_BLOCKING_BOOKING_STATUSES = new Set([
  "CANCELLED",
  "CANCELED",
  "REFUNDED",
  "VOID",
])

function isBookingBlockingInventory(status: string | null | undefined): boolean {
  if (status == null || String(status).trim() === "") return true
  const u = String(status).toUpperCase().trim()
  return !NON_BLOCKING_BOOKING_STATUSES.has(u)
}

/**
 * Guest stay [checkIn, checkOut) vs booking [bIn, bOut) in date-only YYYY-MM-DD.
 */
function stayOverlapsBooking(checkIn: string, checkOut: string, bIn: string, bOut: string): boolean {
  return checkIn < bOut && bIn < checkOut
}

/**
 * Rooms already assigned to an active booking overlapping the stay.
 */
async function fetchBookedRoomIdsForStay(
  client: SupabaseClient,
  roomIds: string[],
  checkIn: string,
  checkOut: string,
): Promise<Set<string>> {
  const blocked = new Set<string>()
  if (roomIds.length === 0) return blocked

  const { data: items, error: iErr } = await client
    .from("booking_items")
    .select("room_id, booking_id")
    .in("room_id", roomIds)

  if (iErr) throw iErr
  const rows = items ?? []
  if (rows.length === 0) return blocked

  const bookingIds = [...new Set(rows.map((r) => String(r.booking_id)))]

  const { data: bookings, error: bErr } = await client
    .from("bookings")
    .select("id, check_in_date, check_out_date, status")
    .in("id", bookingIds)

  if (bErr) throw bErr
  const bookingMap = new Map<string, { check_in_date: string; check_out_date: string; status: string }>()
  for (const b of bookings ?? []) {
    bookingMap.set(String(b.id), {
      check_in_date: String(b.check_in_date),
      check_out_date: String(b.check_out_date),
      status: String(b.status ?? ""),
    })
  }

  for (const it of rows) {
    const b = bookingMap.get(String(it.booking_id))
    if (!b) continue
    if (!isBookingBlockingInventory(b.status)) continue
    const bIn = normalizePgDate(b.check_in_date)
    const bOut = normalizePgDate(b.check_out_date)
    if (stayOverlapsBooking(checkIn, checkOut, bIn, bOut)) {
      blocked.add(String(it.room_id))
    }
  }

  return blocked
}

function buildMaintenanceBlockedKeys(
  availRows: { room_id: string; date: string; is_available: boolean | null }[],
): Set<string> {
  const keys = new Set<string>()
  for (const r of availRows) {
    if (r.is_available === false) {
      keys.add(`${r.room_id}|${normalizePgDate(r.date)}`)
    }
  }
  return keys
}

/**
 * Vacant for the stay: not in an overlapping booking, and no room_availability row marks a night unavailable.
 * Missing availability rows = treat as open (maintenance calendar optional).
 */
function countVacantRoomsForStay(
  roomIds: string[],
  nights: string[],
  maintenanceBlocked: Set<string>,
  bookedRoomIds: Set<string>,
): number {
  if (roomIds.length === 0 || nights.length === 0) return 0
  let count = 0
  for (const rid of roomIds) {
    if (bookedRoomIds.has(rid)) continue
    let ok = true
    for (const night of nights) {
      if (maintenanceBlocked.has(`${rid}|${night}`)) {
        ok = false
        break
      }
    }
    if (ok) count++
  }
  return count
}

export interface SearchRoomsParams {
  checkIn: string
  checkOut: string
  roomCount: number
  adults: number
  children: number
}

/**
 * Minimum max_occupancy per room so `roomCount` rooms can fit `totalGuests`.
 */
export function minOccupancyPerRoom(totalGuests: number, roomCount: number): number {
  if (roomCount < 1) return 1
  return Math.max(1, Math.ceil(totalGuests / roomCount))
}

export async function fetchSearchResultRooms(
  client: SupabaseClient,
  params: SearchRoomsParams,
): Promise<SearchResultRoom[]> {
  const totalGuests = params.adults + params.children
  const minOcc = minOccupancyPerRoom(totalGuests, params.roomCount)
  const nights = stayNightDatesIso(params.checkIn, params.checkOut)

  if (nights.length === 0) {
    return []
  }

  const { data: typesRaw, error: typesErr } = await client
    .from("room_types")
    .select("id, name, description, max_occupancy, base_price, discounted_price, amenities")
    .gte("max_occupancy", minOcc)

  if (typesErr) throw typesErr
  const types = typesRaw ?? []
  if (types.length === 0) return []

  const typeIds = types.map((t) => t.id as string)

  const { data: roomsRaw, error: roomsErr } = await client
    .from("rooms")
    .select("id, room_type_id, bed_type")
    .in("room_type_id", typeIds)
    .is("deleted_at", null)

  if (roomsErr) throw roomsErr
  const invRooms = roomsRaw ?? []

  const { data: imagesRaw, error: imgErr } = await client
    .from("room_type_images")
    .select("room_type_id, image_url, is_primary, sort_order")
    .in("room_type_id", typeIds)

  if (imgErr) throw imgErr
  const imagesByType = new Map<string, { image_url: string; is_primary: boolean | null; sort_order: number | null }[]>()
  for (const row of imagesRaw ?? []) {
    const tid = row.room_type_id as string
    if (!imagesByType.has(tid)) imagesByType.set(tid, [])
    imagesByType.get(tid)!.push({
      image_url: row.image_url as string,
      is_primary: row.is_primary as boolean | null,
      sort_order: row.sort_order as number | null,
    })
  }

  const roomIds = invRooms.map((r) => r.id as string)

  let availRows: { room_id: string; date: string; is_available: boolean | null }[] = []
  if (roomIds.length > 0) {
    const minD = nights[0]!
    const maxD = nights[nights.length - 1]!
    const { data: ar, error: avErr } = await client
      .from("room_availability")
      .select("room_id, date, is_available")
      .in("room_id", roomIds)
      .gte("date", minD)
      .lte("date", maxD)
    if (avErr) throw avErr
    availRows = (ar ?? []) as { room_id: string; date: string; is_available: boolean | null }[]
  }

  const maintenanceBlocked = buildMaintenanceBlockedKeys(availRows)

  const bookedRoomIds =
    roomIds.length > 0
      ? await fetchBookedRoomIdsForStay(client, roomIds, params.checkIn, params.checkOut)
      : new Set<string>()

  const bedByType = new Map<string, string>()
  for (const r of invRooms) {
    const tid = r.room_type_id as string
    if (!bedByType.has(tid) && r.bed_type) {
      bedByType.set(tid, String(r.bed_type))
    }
  }

  const out: SearchResultRoom[] = []

  for (const t of types) {
    const id = t.id as string
    const roomsOfType = invRooms.filter((r) => r.room_type_id === id).map((r) => r.id as string)
    const availableCount = countVacantRoomsForStay(
      roomsOfType,
      nights,
      maintenanceBlocked,
      bookedRoomIds,
    )

    if (availableCount < params.roomCount) continue

    const imgs = imagesByType.get(id) ?? []
    const urls = sortImages(imgs)
    const cover = urls[0] ?? ""

    const base = priceNumber(t.base_price)
    const disc = t.discounted_price != null ? priceNumber(t.discounted_price) : base
    const sqm = parseSqmFromDescription((t.description as string) ?? null)
    const maxOcc = Number(t.max_occupancy ?? 0)

    const row: SearchResultRoom = {
      id,
      name: String(t.name ?? ""),
      description: String(t.description ?? ""),
      coverImage: cover,
      guests: maxOcc,
      bedLabel: bedByType.get(id) ?? "—",
      sqm,
      originalPrice: base,
      currentPrice: disc > 0 ? disc : base,
    }

    if (availableCount < 3) {
      row.roomsLeft = availableCount
    }

    out.push(row)
  }

  out.sort((a, b) => a.guests - b.guests)

  return out
}

type RoomTypeRow = {
  id: string
  name: string
  description: string | null
  max_occupancy: number
  base_price: unknown
  discounted_price: unknown | null
  amenities: unknown
}

export async function fetchRoomTypeDetail(
  client: SupabaseClient,
  routeParam: string,
): Promise<{
  room: Room
} | null> {
  const id = resolveRoomTypeIdParam(routeParam)

  const { data: t, error: tErr } = await client
    .from("room_types")
    .select("id, name, description, max_occupancy, base_price, discounted_price, amenities")
    .eq("id", id)
    .maybeSingle()

  if (tErr) throw tErr
  if (!t) return null

  const row = t as RoomTypeRow

  const { data: imgs, error: iErr } = await client
    .from("room_type_images")
    .select("image_url, is_primary, sort_order")
    .eq("room_type_id", id)

  if (iErr) throw iErr
  const imageList = sortImages((imgs ?? []) as { image_url: string; is_primary: boolean | null; sort_order: number | null }[])

  const { data: sampleRoom } = await client
    .from("rooms")
    .select("bed_type")
    .eq("room_type_id", id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle()

  const base = priceNumber(row.base_price)
  const disc = row.discounted_price != null ? priceNumber(row.discounted_price) : base
  const current = disc > 0 ? disc : base

  const room: Room = {
    id,
    name: row.name,
    shortDescription: row.description ?? "",
    images: imageList.length > 0 ? imageList : ["/LandingPagePic/SlidePic1.jpg"],
    coverImage: imageList[0] ?? "/LandingPagePic/SlidePic1.jpg",
    guests: row.max_occupancy,
    bedType: (sampleRoom?.bed_type as string) ?? "—",
    sqm: parseSqmFromDescription(row.description),
    originalPrice: base,
    currentPrice: current,
    amenities: asStringArray(row.amenities),
  }

  return { room }
}

export async function fetchOtherRoomTypesForCarousel(
  client: SupabaseClient,
  excludeTypeId: string,
): Promise<Room[]> {
  const { data: types, error } = await client
    .from("room_types")
    .select("id, name, description, max_occupancy, base_price, discounted_price, amenities")
    .neq("id", excludeTypeId)
    .order("name")

  if (error) throw error
  const list = types ?? []
  if (list.length === 0) return []

  const ids = list.map((t) => t.id as string)
  const { data: imgs } = await client
    .from("room_type_images")
    .select("room_type_id, image_url, is_primary, sort_order")
    .in("room_type_id", ids)

  const imagesByType = new Map<string, { image_url: string; is_primary: boolean | null; sort_order: number | null }[]>()
  for (const row of imgs ?? []) {
    const tid = row.room_type_id as string
    if (!imagesByType.has(tid)) imagesByType.set(tid, [])
    imagesByType.get(tid)!.push({
      image_url: row.image_url as string,
      is_primary: row.is_primary as boolean | null,
      sort_order: row.sort_order as number | null,
    })
  }

  const { data: beds } = await client
    .from("rooms")
    .select("room_type_id, bed_type")
    .in("room_type_id", ids)
    .is("deleted_at", null)

  const bedByType = new Map<string, string>()
  for (const r of beds ?? []) {
    const tid = r.room_type_id as string
    if (!bedByType.has(tid) && r.bed_type) bedByType.set(tid, String(r.bed_type))
  }

  return list.map((t) => {
    const tid = t.id as string
    const urls = sortImages(imagesByType.get(tid) ?? [])
    const base = priceNumber(t.base_price)
    const disc = t.discounted_price != null ? priceNumber(t.discounted_price) : base
    const current = disc > 0 ? disc : base
    return {
      id: tid,
      name: String(t.name ?? ""),
      shortDescription: String(t.description ?? ""),
      images: urls.length > 0 ? urls : ["/LandingPagePic/SlidePic1.jpg"],
      coverImage: urls[0] ?? "/LandingPagePic/SlidePic1.jpg",
      guests: Number(t.max_occupancy ?? 0),
      bedType: bedByType.get(tid) ?? "—",
      sqm: parseSqmFromDescription((t.description as string) ?? null),
      originalPrice: base,
      currentPrice: current,
      amenities: asStringArray(t.amenities),
    }
  })
}
