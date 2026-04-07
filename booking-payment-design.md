# Booking & Payment System — Design Summary

---

## ภาพรวมของ Flow

```
Search Page (LandingDateRangePicker + guest picker)
  └─ navigate to /search?checkIn=...&checkOut=...&rooms=...&adults=...&children=...
        ↓
SearchResultView.vue
  └─ อ่าน query params → fetchSearchResultRooms(supabase, params) → แสดง SearchResultRoomCard
        ↓ กด "Book Now"
SearchResultRoomCard.vue  /  RoomDetailView.vue
  └─ อ่านค่าจาก useRoute().query + room props → bookingStore.setRoom() + startTimer() → navigate /payment-basic
        ↓
Step 1: /payment-basic     — Basic Information (ดึง user จาก auth store)
        ↓ กด "Next"
Step 2: /payment-request   — Special Request & Extra Services
        ↓ กด "Next"
Step 3: /payment-method    — Payment Method
        ↓ กด "Confirm Booking"
/payment-success หรือ /payment-fail
```

---

## Search System

### URL Query Params

| Param | Type | ตัวอย่าง | Default |
|---|---|---|---|
| `checkIn` | ISO date string | `2025-10-19` | today |
| `checkOut` | ISO date string | `2025-10-21` | tomorrow |
| `rooms` | number string | `"2"` | `"1"` |
| `adults` | number string | `"2"` | `"2"` |
| `children` | number string | `"0"` | `"0"` |

---

## Extra Services — ประเภท (type)

| type | แสดงเป็น | แสดงราคา |
|---|---|---|
| `FREE` | Standard Request | ไม่มีราคา (แสดง 0.00 ใน summary) |
| `PAID` | Special Request | มีราคา (+THB xxx) |

ทั้ง FREE และ PAID ใช้ `selectedExtraIds` (UUID) เหมือนกัน — ส่งใน `extraServiceIds` ตอน createBooking

---

## 5-Minute Timer

- `bookingStore.startTimer()` ถูก call ใน `SearchResultRoomCard.handleBookNow` และ `RoomDetailView.handleBookNow`
- ทุก payment view import `useBookingTimer()` → แสดง countdown ใน Booking Detail header
- ครบ 5 นาที → modal "เซสชันหมดเวลา" โผล่
  - "ดำเนินการต่อ" → `extendTimer()` reset +5 นาที
  - "เริ่มค้นหาใหม่" → `bookingStore.reset()` + navigate `/search`

---

## Booking Status Flow

| เหตุการณ์ | Status |
|---|---|
| สร้าง booking (จ่ายด้วยบัตร) | `PENDING_PAYMENT` |
| สร้าง booking (จ่ายเงินสด) | `PENDING_CHECKIN` |
| จ่ายบัตรสำเร็จ | `PAID` |
| จ่ายบัตรล้มเหลว | `FAILED` |

Status อัปเดต 2 ทาง (double confirmation):
1. **Frontend** — หลัง `stripe.confirmCardPayment()` ตอบกลับ → `PATCH /api/v1/payments/{bookingId}/status`
2. **Stripe Webhook** — `payment_intent.succeeded` / `payment_intent.payment_failed` → `StripeWebhookService` อัปเดต DB โดยตรง (reliable fallback)

---

## Stripe Card Payment Flow

```
handleConfirm (card)
  1. createBooking() → bookingId  (ข้ามถ้า retry)
  2. createPaymentIntent(bookingId) → clientSecret
  3. stripe.confirmCardPayment(clientSecret, { card: cardElement })
     → success → updatePaymentStatus(bookingId, 'PAID') → /payment-success
     → error   → updatePaymentStatus(bookingId, 'FAILED') → /payment-fail
```

- ใช้ Stripe Elements (`card` element) แทน raw input
- `hidePostalCode: true` — ไม่แสดงช่อง ZIP
- `v-show` แทน `v-if` เพื่อรักษา DOM element ไว้ตอน switch ระหว่าง card/cash

---

## API Endpoints Summary

| Action | Method | Endpoint | Auth | Status |
|---|---|---|---|---|
| Load extra services | GET | `/api/v1/extra-services` | ไม่ต้อง | ✅ พร้อม |
| Validate promo code | POST | `/api/v1/promotions/validate` | ไม่ต้อง | ✅ พร้อม |
| Create booking | POST | `/api/v1/bookings` | ต้อง | ✅ พร้อม |
| Create payment intent | POST | `/api/v1/payments/create-intent` | ต้อง | ✅ พร้อม |
| Update booking status | PATCH | `/api/v1/payments/{bookingId}/status` | ต้อง | ✅ พร้อม |
| Stripe webhook | POST | `/api/v1/webhooks/stripe` | ไม่ต้อง | ✅ พร้อม |

---

## Checklist

### ✅ เสร็จแล้ว

| File | งาน |
|---|---|
| `src/stores/booking.ts` | Pinia store ครบ (room, guestInfo, extras, payment, timer) |
| `src/api/booking.ts` | createBooking, getExtraServices, createPaymentIntent, validatePromoCode, updatePaymentStatus |
| `src/composables/useBookingTimer.ts` | 5-min countdown, modal on expiry, extendTimer |
| `src/components/BookingTimerModal.vue` | Modal "เซสชันหมดเวลา" |
| `src/views/PaymentBasicInfo.vue` | pre-fill auth + store + validation + timer |
| `src/views/PaymentSpecialRequest.vue` | FREE/PAID split จาก API, standard requests ใน summary (0.00), timer |
| `src/views/PaymentMethod.vue` | Stripe Elements, hidePostalCode, promo API, cash/card flow, status update, retry, timer |
| `src/views/PaymentSuccess.vue` | แสดงข้อมูลจาก store + reset |
| `src/views/PaymentFail.vue` | Retry payment handler |
| `src/components/search/SearchResultRoomCard.vue` | เชื่อม bookingStore + startTimer + query params |
| `src/views/RoomDetailView.vue` | handleBookNow เชื่อม bookingStore + startTimer + navigate |
| `ExtraServiceController.java` | GET /api/v1/extra-services (public) |
| `BookingService.java` | real user จาก JWT, status CASH/CARD |
| `PaymentService.java` | Stripe PaymentIntent จริง (THB satang) + updateStatus() |
| `PaymentController.java` | POST /api/v1/payments/create-intent + PATCH /{bookingId}/status |
| `StripeWebhookService.java` | บันทึก event + อัปเดต booking status (PAID/FAILED) จาก metadata |
| `PromotionService.validatePromo()` | check active, date, usage, minSpend, คำนวณ discount |
| `PromoValidateController.java` | POST /api/v1/promotions/validate (public) |
| `SecurityConfig.java` | extra-services + promotions/validate เป็น public |

---

### ❌ ยังไม่เสร็จ (blocked โดย system อื่น)

| # | งาน | หมายเหตุ |
|---|---|---|
| 1 | **Pre-fill phone/dateOfBirth/country** ใน PaymentBasicInfo | `UserResponse` ยังไม่ส่ง phone/dob/country จาก Profile — รอ backend team แก้ |
| 2 | **ดึง pricePerNight จาก RoomType จริง** ใน BookingService | ตอนนี้ hardcode = 1000 — รอ room management system |
| 3 | **สร้าง BookingItem records** ต่อห้อง | ตอนนี้ไม่สร้าง record แยกต่อห้อง — รอ room availability system |

---

## Retry Payment Logic

```
กด "Retry payment" → router.push('/payment-method')

ใน PaymentMethod.vue กด Confirm อีกครั้ง:
  if (bookingStore.bookingId) {
    // booking มีแล้ว → ข้าม POST /bookings → ยิงแค่ Stripe อีกครั้ง
  } else {
    // booking ยังไม่มี → สร้างใหม่ปกติ
  }
```

---

## Stripe Test Cards

| Card | ผลลัพธ์ |
|---|---|
| `4242 4242 4242 4242` | สำเร็จ |
| `4000 0000 0000 0002` | ถูกปฏิเสธ (declined) |
| Expiry: ใดก็ได้ (เช่น `12/34`) | CVV: ใดก็ได้ (เช่น `123`) | |
