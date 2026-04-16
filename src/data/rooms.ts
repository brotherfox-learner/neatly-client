export interface Room {
  id: string
  name: string
  shortDescription: string
  images: string[]
  coverImage: string
  guests: number
  bedType: string
  sqm: number
  originalPrice: number
  currentPrice: number
  amenities: string[]
}

export const rooms: Room[] = [
  {
    id: "superior-garden-view",
    name: "Superior Garden View",
    shortDescription:
      "Rooms (36sqm) with full garden views, 1 single bed, bathroom with bathtub & shower.",
    images: [
      "/LandingPagePic/SlidePic1.jpg",
      "/LandingPagePic/SuperiorGardenView.jpg",
      "/LandingPagePic/SlidePic4.jpg",
      "/LandingPagePic/SlidePic3.jpg",
    ],
    coverImage: "/LandingPagePic/SuperiorGardenView.jpg",
    guests: 2,
    bedType: "1 Double Bed",
    sqm: 32,
    originalPrice: 3100,
    currentPrice: 2500,
    amenities: [
      "Safe In Room",
      "Minibar",
      "Air Conditioning",
      "Telephone",
      "High speed Internet connection",
      "Ironing board",
      "Hairdryer",
      "A floor only accessible via a guest room key",
      "Shower",
      "Alarm clock",
      "Bathroom amenities",
      "Bathrobe",
      "Lamp",
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    shortDescription:
      "Spacious rooms (48sqm) featuring a king bed, large soaking tub, and stunning city skyline views.",
    images: [
      "/LandingPagePic/Deluxe.jpg",
      "/LandingPagePic/SlidePic1.jpg",
      "/LandingPagePic/SlidePic2.jpg",
      "/LandingPagePic/SlidePic5.jpg",
    ],
    coverImage: "/LandingPagePic/Deluxe.jpg",
    guests: 2,
    bedType: "1 King Bed",
    sqm: 48,
    originalPrice: 4500,
    currentPrice: 3800,
    amenities: [
      "Safe In Room",
      "Minibar",
      "Air Conditioning",
      "Telephone",
      "High speed Internet connection",
      "Ironing board",
      "Hairdryer",
      "Alarm clock",
      "Bathtub",
      "Bathrobe",
      "Bathroom amenities",
      "Coffee Machine",
      "Lamp",
    ],
  },
  {
    id: "superior",
    name: "Superior",
    shortDescription:
      "Comfortable rooms (32sqm) with modern furnishings, perfect for business or leisure travel.",
    images: [
      "/LandingPagePic/Superior.jpg",
      "/LandingPagePic/SlidePic4.jpg",
      "/LandingPagePic/SlidePic2.jpg",
      "/LandingPagePic/SlidePic1.jpg",
    ],
    coverImage: "/LandingPagePic/Superior.jpg",
    guests: 2,
    bedType: "1 Double Bed",
    sqm: 32,
    originalPrice: 3500,
    currentPrice: 2900,
    amenities: [
      "Safe In Room",
      "Minibar",
      "Air Conditioning",
      "Telephone",
      "High speed Internet connection",
      "Alarm clock",
      "Hairdryer",
      "Bathrobe",
      "Shower",
      "Bathroom amenities",
      "Lamp",
    ],
  },
  {
    id: "premier-sea-view",
    name: "Premier Sea View",
    shortDescription:
      "Breathtaking ocean panoramas (52sqm) from your private balcony — a true coastal retreat.",
    images: [
      "/LandingPagePic/PremierSeaView.jpg",
      "/LandingPagePic/SlidePic5.jpg",
      "/LandingPagePic/SlidePic3.jpg",
      "/LandingPagePic/SlidePic2.jpg",
    ],
    coverImage: "/LandingPagePic/PremierSeaView.jpg",
    guests: 2,
    bedType: "1 King Bed",
    sqm: 52,
    originalPrice: 6500,
    currentPrice: 5200,
    amenities: [
      "Safe In Room",
      "Minibar",
      "Air Conditioning",
      "Telephone",
      "High speed Internet connection",
      "Ironing board",
      "Hairdryer",
      "Alarm clock",
      "Bathtub",
      "Bathrobe",
      "Bathroom amenities",
      "Sea View Balcony",
      "Lamp",
    ],
  },
  {
    id: "supreme",
    name: "Supreme",
    shortDescription:
      "Luxuriously appointed (65sqm) with a separate seating area, premium bedding, and bespoke finishes.",
    images: [
      "/LandingPagePic/SupremeRoom.jpg",
      "/LandingPagePic/SlidePic3.jpg",
      "/LandingPagePic/SlidePic1.jpg",
      "/LandingPagePic/SlidePic4.jpg",
    ],
    coverImage: "/LandingPagePic/SupremeRoom.jpg",
    guests: 3,
    bedType: "1 King Bed",
    sqm: 65,
    originalPrice: 8000,
    currentPrice: 6500,
    amenities: [
      "Safe In Room",
      "Minibar",
      "Air Conditioning",
      "Coffee Machine",
      "High speed Internet connection",
      "Ironing board",
      "Hairdryer",
      "Alarm clock",
      "Bathtub",
      "Bathrobe",
      "Bathroom amenities",
      "Living Area",
      "Telephone",
    ],
  },
  {
    id: "suite",
    name: "Suite",
    shortDescription:
      "The pinnacle of luxury (80sqm) with a separate living room, dining area, and unparalleled amenities.",
    images: [
      "/LandingPagePic/Suite.jpg",
      "/LandingPagePic/SlidePic3.jpg",
      "/LandingPagePic/SlidePic5.jpg",
      "/LandingPagePic/SlidePic2.jpg",
    ],
    coverImage: "/LandingPagePic/Suite.jpg",
    guests: 4,
    bedType: "1 King + Sofa Bed",
    sqm: 80,
    originalPrice: 12000,
    currentPrice: 9800,
    amenities: [
      "Safe In Room",
      "Minibar",
      "Air Conditioning",
      "Coffee Machine",
      "High speed Internet connection",
      "Ironing board",
      "Hairdryer",
      "Alarm clock",
      "Bathtub",
      "Bathrobe",
      "Bathroom amenities",
      "Living Area",
      "Kitchen",
      "Dining Area",
      "Telephone",
      "Sea View Balcony",
    ],
  },
]

export function getRoomById(id: string): Room | undefined {
  return rooms.find((r) => r.id === id)
}

export function getOtherRooms(currentId: string): Room[] {
  return rooms.filter((r) => r.id !== currentId)
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
