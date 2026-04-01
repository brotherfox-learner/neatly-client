/** Mock rows for the search results list (design spec: same promo price & copy). */
export interface SearchResultMockRoom {
  id: string
  name: string
  description: string
  coverImage: string
  guests: number
  bedLabel: string
  sqm: number
  originalPrice: number
  currentPrice: number
}

export const searchResultMockRooms: SearchResultMockRoom[] = [
  {
    id: "superior-garden-view",
    name: "Superior Garden View",
    description:
      "Rooms (36sqm) with full garden views, 1 single bed, bathroom with bathtub & shower.",
    coverImage: "/LandingPagePic/SuperiorGardenView.jpg",
    guests: 2,
    bedLabel: "1 Double bed",
    sqm: 32,
    originalPrice: 3100,
    currentPrice: 2500,
  },
  {
    id: "deluxe",
    name: "Deluxe",
    description:
      "Rooms (32sqm) with full garden views, 1 double bed, bathroom with bathtub & shower.",
    coverImage: "/LandingPagePic/Deluxe.jpg",
    guests: 2,
    bedLabel: "1 Double bed",
    sqm: 32,
    originalPrice: 3100,
    currentPrice: 2500,
  },
  {
    id: "superior",
    name: "Superior",
    description:
      "Rooms (32sqm) with full garden views, 1 double bed, bathroom with bathtub & shower.",
    coverImage: "/LandingPagePic/Superior.jpg",
    guests: 2,
    bedLabel: "1 Double bed",
    sqm: 32,
    originalPrice: 3100,
    currentPrice: 2500,
  },
  {
    id: "supreme",
    name: "Supreme",
    description:
      "Rooms (32sqm) with full garden views, 1 double bed, bathroom with bathtub & shower.",
    coverImage: "/LandingPagePic/SupremeRoom.jpg",
    guests: 2,
    bedLabel: "1 Double bed",
    sqm: 32,
    originalPrice: 3100,
    currentPrice: 2500,
  },
]
