# AI Digital Wardrobe — Backend Build Guide
### Prisma Schema + API Reference + Phased Module Plan

This document is built to match your existing module structure:

```
src/modules/{admin, ai, auth, outfits, subscriptions, users, wardrobe}
  ├── constants.ts
  ├── controller.ts
  ├── index.ts
  ├── repository.ts
  ├── routes.ts
  ├── service.ts
  ├── types.ts
  └── validation.ts
```

**How to use this doc:** don't build everything at once. Each phase below tells you
exactly which Prisma models and which API endpoints belong to which module, in the
order to build them. Add new module folders only when a phase calls for them (the
list stays the same shape — `constants/controller/index/repository/routes/service/types/validation`).

---

## 1. Phase Map (module-by-module)

| Phase | Modules touched | New modules to create |
|---|---|---|
| **Phase 1 — MVP** | `auth`, `users`, `wardrobe`, `outfits` | none (all already exist) |
| **Phase 2 — Habits & Ops** | `wardrobe` (laundry), `outfits` (calendar/history), `users` (stats), `subscriptions` | `notifications` |
| **Phase 3 — Core AI** | `ai` (detection, tagging, background removal, stylist chat, weather, outfit suggestions) | none |
| **Phase 4 — Advanced AI + Commerce** | `ai` (virtual try-on, closet analysis, packing), `subscriptions` (limits/gating) | `shopping` (wishlist, price tracking, shopping assistant) |
| **Phase 5 — Social & Admin depth** | `admin` (full panel) | `social` (share/like/comment) |

Build strictly in this order. Every phase is additive — nothing in a later phase requires changing an earlier phase's tables, only extending them.

---

## 2. Full Prisma Schema (phased)

Copy this into `prisma/schema.prisma`. It's written as **one complete schema**, but every
block is labeled with the phase it belongs to — comment out/remove blocks for phases
you haven't built yet, or just add them incrementally and run a fresh migration per phase
(recommended, matches your existing `20260804150732_init_auth` migration pattern).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =========================================================
// PHASE 1 — AUTH MODULE
// =========================================================

enum AuthProvider {
  LOCAL
  GOOGLE
  APPLE
}

enum UserRole {
  USER
  PREMIUM
  ADMIN
}

model User {
  id                String       @id @default(cuid())
  email             String       @unique
  passwordHash      String?      // null if OAuth-only
  provider          AuthProvider @default(LOCAL)
  providerId        String?
  role              UserRole     @default(USER)
  isEmailVerified   Boolean      @default(false)
  emailVerifiedAt   DateTime?
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  profile           Profile?
  refreshTokens     RefreshToken[]
  passwordResets    PasswordResetToken[]
  emailVerifications EmailVerificationToken[]

  clothingItems     ClothingItem[]
  outfits           Outfit[]
  outfitHistory     OutfitHistoryEntry[]
  scheduledOutfits  ScheduledOutfit[]

  subscription      Subscription?
  notifications     Notification[]
  notificationSettings NotificationSetting?

  aiChatSessions    AiChatSession[]
  aiRequestLogs     AiRequestLog[]

  wishlistItems     WishlistItem[]
  sharedOutfits     SharedOutfit[]
  outfitLikes       OutfitLike[]
  outfitComments    OutfitComment[]

  adminReports      Report[] @relation("ReportedByAdmin")

  @@index([email])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}

model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}

// =========================================================
// PHASE 1 — USERS MODULE (profile)
// =========================================================

enum Gender {
  MALE
  FEMALE
  OTHER
  UNSPECIFIED
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

model Profile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name             String?
  avatarUrl        String?
  gender           Gender?  @default(UNSPECIFIED)
  heightCm         Float?
  weightKg         Float?
  preferredStyle   String?  // e.g. "Minimalist", "Streetwear"
  favoriteColors   String[] @default([])
  clothingSizes    Json?    // { top: "M", bottom: "32", shoe: "10" }
  theme            Theme    @default(SYSTEM)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// =========================================================
// PHASE 1 — WARDROBE MODULE (core)
// PHASE 2 adds: laundryStatus usage, lastWornAt updates from history
// =========================================================

enum ClothingCategory {
  T_SHIRT
  SHIRT
  POLO_SHIRT
  HOODIE
  JACKET
  COAT
  SWEATER
  JEANS
  PANTS
  SHORTS
  JOGGERS
  DRESS
  SKIRT
  SUIT
  SHOES
  BOOTS
  SANDALS
  WATCH
  GLASSES
  BELT
  HAT
  JEWELRY
  BAG
  ACCESSORY
}

enum Season {
  SPRING
  SUMMER
  FALL
  WINTER
  ALL_SEASON
}

enum Occasion {
  CASUAL
  OFFICE
  FORMAL
  PARTY
  WEDDING
  GYM
  TRAVEL
  DATE_NIGHT
  OTHER
}

// PHASE 2
enum LaundryStatus {
  AVAILABLE
  DIRTY
  WASHING
  DRYING
  MISSING
}

model ClothingItem {
  id              String           @id @default(cuid())
  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String
  category        ClothingCategory
  brand           String?
  color           String?
  pattern         String?
  material        String?
  season          Season?          @default(ALL_SEASON)
  occasion        Occasion?
  size            String?
  purchaseDate    DateTime?
  purchasePrice   Decimal?         @db.Decimal(10, 2)
  notes           String?

  isFavorite      Boolean          @default(false)
  isArchived      Boolean          @default(false)
  laundryStatus   LaundryStatus    @default(AVAILABLE) // Phase 2

  lastWornAt      DateTime?
  wearCount       Int              @default(0)

  tags            String[]         @default([]) // AI-generated + manual, Phase 3

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  images          ClothingImage[]
  outfitItems     OutfitItem[]
  historyEntries  OutfitHistoryEntry[] @relation("HistoryClothingItems")

  @@index([userId])
  @@index([userId, category])
  @@index([userId, isArchived])
}

model ClothingImage {
  id             String       @id @default(cuid())
  clothingItemId String
  clothingItem   ClothingItem @relation(fields: [clothingItemId], references: [id], onDelete: Cascade)
  url            String
  isCover        Boolean      @default(false)
  order          Int          @default(0)
  createdAt      DateTime     @default(now())

  @@index([clothingItemId])
}

// =========================================================
// PHASE 1 — OUTFITS MODULE (builder)
// PHASE 2 adds: OutfitHistoryEntry, ScheduledOutfit
// =========================================================

enum OutfitCategory {
  CASUAL
  OFFICE
  FORMAL
  PARTY
  WEDDING
  GYM
  TRAVEL
  WINTER
  SUMMER
  DATE_NIGHT
  CUSTOM
}

model Outfit {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  category    OutfitCategory @default(CUSTOM)
  isFavorite  Boolean        @default(false)
  isAiGenerated Boolean      @default(false) // Phase 3
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  items            OutfitItem[]
  historyEntries   OutfitHistoryEntry[]
  scheduledEntries ScheduledOutfit[]
  sharedOutfit     SharedOutfit?
  ratings          OutfitAiRating[] // Phase 3

  @@index([userId])
}

model OutfitItem {
  id             String       @id @default(cuid())
  outfitId       String
  outfit         Outfit       @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  clothingItemId String
  clothingItem   ClothingItem @relation(fields: [clothingItemId], references: [id], onDelete: Cascade)
  layerOrder     Int          @default(0) // for drag & drop stacking

  @@unique([outfitId, clothingItemId])
  @@index([outfitId])
}

// PHASE 2
model OutfitHistoryEntry {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitId  String?
  outfit    Outfit?  @relation(fields: [outfitId], references: [id], onDelete: SetNull)
  wornDate  DateTime
  notes     String?
  clothingItems ClothingItem[] @relation("HistoryClothingItems") // supports logging a "look" without a saved outfit
  createdAt DateTime @default(now())

  @@index([userId, wornDate])
}

// PHASE 2
model ScheduledOutfit {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitId     String
  outfit       Outfit   @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  scheduledFor DateTime
  reminderSent Boolean  @default(false)
  createdAt    DateTime @default(now())

  @@index([userId, scheduledFor])
}

// =========================================================
// PHASE 2 — SUBSCRIPTIONS MODULE
// =========================================================

enum SubscriptionPlan {
  FREE
  PREMIUM
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  EXPIRED
  TRIALING
  PAST_DUE
}

model Subscription {
  id                 String             @id @default(cuid())
  userId             String             @unique
  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan               SubscriptionPlan   @default(FREE)
  status             SubscriptionStatus @default(ACTIVE)
  provider           String?            // "stripe", "apple", "google"
  providerCustomerId String?
  providerSubId      String?
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean            @default(false)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

// =========================================================
// PHASE 2 — NOTIFICATIONS MODULE (new)
// =========================================================

enum NotificationType {
  LAUNDRY_REMINDER
  SCHEDULED_OUTFIT_REMINDER
  WISHLIST_PRICE_ALERT
  NEW_AI_SUGGESTION
  SYSTEM
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false)
  metadata  Json?
  createdAt DateTime         @default(now())

  @@index([userId, isRead])
}

model NotificationSetting {
  id                      String  @id @default(cuid())
  userId                  String  @unique
  user                    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  laundryReminders        Boolean @default(true)
  outfitReminders         Boolean @default(true)
  wishlistAlerts          Boolean @default(true)
  aiSuggestions           Boolean @default(true)
  pushEnabled             Boolean @default(true)
  emailEnabled            Boolean @default(false)
}

// =========================================================
// PHASE 3 — AI MODULE (detection, tagging, chat, weather, suggestions)
// PHASE 4 adds: try-on, closet analysis, packing, shopping assistant results
// =========================================================

enum AiRequestType {
  CLOTHING_DETECTION
  BACKGROUND_REMOVAL
  OUTFIT_SUGGESTION
  OUTFIT_RATING
  STYLIST_CHAT
  WEATHER_SUGGESTION
  EVENT_SUGGESTION
  PACKING_ASSISTANT     // Phase 4
  CLOSET_ANALYSIS       // Phase 4
  SHOPPING_ASSISTANT    // Phase 4
  SIMILAR_SEARCH        // Phase 4
  DUPLICATE_DETECTION   // Phase 4
  VIRTUAL_TRY_ON        // Phase 4
  OUTFIT_IMAGE_GEN      // Phase 4
}

// Every AI call is logged here — this is what powers usage limits/gating for free vs premium
model AiRequestLog {
  id           String        @id @default(cuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type         AiRequestType
  inputSummary Json?
  outputSummary Json?
  tokensUsed   Int?
  success      Boolean       @default(true)
  errorMessage String?
  createdAt    DateTime      @default(now())

  @@index([userId, type, createdAt])
}

model AiChatSession {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  messages  AiChatMessage[]

  @@index([userId])
}

enum ChatRole {
  USER
  ASSISTANT
}

model AiChatMessage {
  id        String        @id @default(cuid())
  sessionId String
  session   AiChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role      ChatRole
  content   String
  createdAt DateTime      @default(now())

  @@index([sessionId])
}

// Phase 3 — result of AI "rate this outfit"
model OutfitAiRating {
  id             String   @id @default(cuid())
  outfitId       String
  outfit         Outfit   @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  colorHarmony   Int      // 0-100
  styleScore     Int
  formalityScore Int
  seasonalFit    Int
  overallScore   Int
  explanation    String
  createdAt      DateTime @default(now())

  @@index([outfitId])
}

// Phase 4 — closet analysis output
enum ClosetAnalysisSuggestionType {
  DONATE
  SELL
  NEVER_WORN
  MISSING_ESSENTIAL
  DUPLICATE
}

model ClosetAnalysisResult {
  id             String                       @id @default(cuid())
  userId         String
  suggestionType ClosetAnalysisSuggestionType
  clothingItemId String?
  reason         String
  createdAt      DateTime                     @default(now())

  @@index([userId, suggestionType])
}

// Phase 4 — packing assistant output
model PackingList {
  id           String   @id @default(cuid())
  userId       String
  tripName     String
  days         Int
  tripType     String   // "beach", "business", "winter", custom text
  destination  String?
  items        Json     // list of clothingItemIds + generic suggested items
  createdAt    DateTime @default(now())

  @@index([userId])
}

// =========================================================
// PHASE 4 — SHOPPING MODULE (new)
// =========================================================

model WishlistItem {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  brand        String?
  imageUrl     String?
  productUrl   String?
  targetPrice  Decimal? @db.Decimal(10, 2)
  currentPrice Decimal? @db.Decimal(10, 2)
  isPurchased  Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  priceHistory PriceHistoryEntry[]

  @@index([userId])
}

model PriceHistoryEntry {
  id             String       @id @default(cuid())
  wishlistItemId String
  wishlistItem   WishlistItem @relation(fields: [wishlistItemId], references: [id], onDelete: Cascade)
  price          Decimal      @db.Decimal(10, 2)
  recordedAt     DateTime     @default(now())

  @@index([wishlistItemId])
}

// =========================================================
// PHASE 5 — SOCIAL MODULE (new)
// =========================================================

model SharedOutfit {
  id         String   @id @default(cuid())
  outfitId   String   @unique
  outfit     Outfit   @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  publicSlug String   @unique
  isPublic   Boolean  @default(true)
  createdAt  DateTime @default(now())

  likes    OutfitLike[]
  comments OutfitComment[]

  @@index([userId])
}

model OutfitLike {
  id             String       @id @default(cuid())
  sharedOutfitId String
  sharedOutfit   SharedOutfit @relation(fields: [sharedOutfitId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())

  @@unique([sharedOutfitId, userId])
}

model OutfitComment {
  id             String       @id @default(cuid())
  sharedOutfitId String
  sharedOutfit   SharedOutfit @relation(fields: [sharedOutfitId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  content        String
  createdAt      DateTime     @default(now())

  @@index([sharedOutfitId])
}

// =========================================================
// PHASE 5 — ADMIN MODULE (depth)
// =========================================================

enum ReportStatus {
  OPEN
  REVIEWED
  RESOLVED
  DISMISSED
}

model Report {
  id            String       @id @default(cuid())
  reportedById  String
  reportedBy    User         @relation("ReportedByAdmin", fields: [reportedById], references: [id])
  targetType    String       // "outfit", "comment", "user"
  targetId      String
  reason        String
  status        ReportStatus @default(OPEN)
  createdAt     DateTime     @default(now())
  resolvedAt    DateTime?
}

model FeatureFlag {
  id        String   @id @default(cuid())
  key       String   @unique
  isEnabled Boolean  @default(false)
  rolloutPercentage Int @default(0)
  description String?
  updatedAt DateTime @updatedAt
}
```

**Migration strategy:** run one migration per phase (e.g. `20260805_init_wardrobe_outfits`,
`20260901_add_notifications_laundry`, etc.) rather than one giant migration. This lets you
ship Phase 1 to production and keep iterating without re-touching finished tables.

---

## 3. API Reference by Module & Phase

Auth conventions used below:
- 🔓 Public (no token)
- 🔐 Authenticated user
- 💎 Authenticated + Premium (gate in `subscriptions` middleware)
- 🛡️ Admin only

### 3.1 `auth` module — Phase 1

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | email + password, sends verification email |
| POST | `/auth/login` | 🔓 | returns access + refresh token |
| POST | `/auth/logout` | 🔐 | revokes refresh token |
| POST | `/auth/refresh` | 🔓 | rotate refresh token → new access token |
| POST | `/auth/forgot-password` | 🔓 | issues `PasswordResetToken`, emails link |
| POST | `/auth/reset-password` | 🔓 | consumes token, sets new password |
| GET  | `/auth/verify-email/:token` | 🔓 | consumes `EmailVerificationToken` |
| POST | `/auth/resend-verification` | 🔐 | rate-limited |
| POST | `/auth/google` | 🔓 | verify Google ID token, create/find `User` |
| POST | `/auth/apple` | 🔓 | verify Apple identity token (mobile) |
| GET  | `/auth/me` | 🔐 | current session's user + role |

### 3.2 `users` module — Phase 1 (profile) / Phase 2 (stats)

| Method | Route | Access | Phase | Notes |
|---|---|---|---|---|
| GET | `/users/me/profile` | 🔐 | 1 | includes `Profile` |
| PATCH | `/users/me/profile` | 🔐 | 1 | name, avatar, height, weight, style, colors, sizes |
| PATCH | `/users/me/theme` | 🔐 | 1 | light/dark/system |
| PATCH | `/users/me/notification-settings` | 🔐 | 2 | toggle each notification type |
| DELETE | `/users/me` | 🔐 | 1 | soft delete (`isActive=false`) + cascade cleanup job |
| GET | `/users/me/stats` | 🔐 | 2 | total clothes, category breakdown, favorites, most/least worn, wardrobe value, cost-per-wear, recent additions (aggregation query, no new table needed — computed from `ClothingItem` + `OutfitHistoryEntry`) |

### 3.3 `wardrobe` module — Phase 1 (core) / Phase 2 (laundry)

| Method | Route | Access | Phase | Notes |
|---|---|---|---|---|
| POST | `/wardrobe/items` | 🔐 | 1 | create clothing item (multipart images) |
| GET | `/wardrobe/items` | 🔐 | 1 | query params: `category, color, brand, season, occasion, favorite, availability, sort, page, limit` |
| GET | `/wardrobe/items/:id` | 🔐 | 1 | |
| PATCH | `/wardrobe/items/:id` | 🔐 | 1 | edit any field |
| DELETE | `/wardrobe/items/:id` | 🔐 | 1 | |
| POST | `/wardrobe/items/:id/duplicate` | 🔐 | 1 | |
| PATCH | `/wardrobe/items/:id/archive` | 🔐 | 1 | toggle `isArchived` |
| PATCH | `/wardrobe/items/:id/favorite` | 🔐 | 1 | toggle `isFavorite` |
| GET | `/wardrobe/search?q=` | 🔐 | 1 | search name/category/brand/color/pattern/material/season/occasion |
| POST | `/wardrobe/items/:id/images` | 🔐 | 1 | upload (multiple), Cloudinary/S3 |
| PATCH | `/wardrobe/items/:id/images/:imageId` | 🔐 | 1 | crop/rotate/replace/set-cover |
| DELETE | `/wardrobe/items/:id/images/:imageId` | 🔐 | 1 | |
| PATCH | `/wardrobe/items/:id/laundry-status` | 🔐 | 2 | available/dirty/washing/drying/missing — `MISSING`/`DIRTY`/`WASHING`/`DRYING` items excluded from AI outfit suggestions in Phase 3 |
| GET | `/wardrobe/laundry?status=` | 🔐 | 2 | list by status, for the laundry tracker screen |

### 3.4 `outfits` module — Phase 1 (builder) / Phase 2 (calendar/history)

| Method | Route | Access | Phase | Notes |
|---|---|---|---|---|
| POST | `/outfits` | 🔐 | 1 | `{ name, category, itemIds: [{clothingItemId, layerOrder}] }` |
| GET | `/outfits` | 🔐 | 1 | filter by category, favorite |
| GET | `/outfits/:id` | 🔐 | 1 | includes items with clothing details |
| PATCH | `/outfits/:id` | 🔐 | 1 | rename, change category/items |
| DELETE | `/outfits/:id` | 🔐 | 1 | |
| POST | `/outfits/:id/duplicate` | 🔐 | 1 | |
| PATCH | `/outfits/:id/favorite` | 🔐 | 1 | |
| POST | `/outfits/history` | 🔐 | 2 | log a worn outfit (`outfitId` optional, or raw `clothingItemIds`), updates `lastWornAt`/`wearCount` on items |
| GET | `/outfits/history?from=&to=` | 🔐 | 2 | |
| POST | `/outfits/schedule` | 🔐 | 2 | `{ outfitId, scheduledFor }` → `ScheduledOutfit` |
| GET | `/outfits/schedule?month=` | 🔐 | 2 | calendar view |
| DELETE | `/outfits/schedule/:id` | 🔐 | 2 | |

### 3.5 `subscriptions` module — Phase 2

| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/subscriptions/me` | 🔐 | current plan/status |
| POST | `/subscriptions/checkout` | 🔐 | creates provider checkout session (Stripe etc.) |
| POST | `/subscriptions/webhook` | 🔓 (signed) | provider webhook → update `Subscription` |
| POST | `/subscriptions/cancel` | 🔐 | sets `cancelAtPeriodEnd=true` |
| GET | `/subscriptions/plans` | 🔓 | static plan list + pricing |

> Build a `requirePremium` middleware here in Phase 2 even though most premium-gated
> features (virtual try-on, unlimited AI) don't exist until Phase 3/4 — wiring the gate
> early means every new AI route just adds one line.

### 3.6 `notifications` module (new) — Phase 2

| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/notifications` | 🔐 | paginated, `?unreadOnly=true` |
| PATCH | `/notifications/:id/read` | 🔐 | |
| PATCH | `/notifications/read-all` | 🔐 | |
| DELETE | `/notifications/:id` | 🔐 | |
| GET | `/notifications/settings` | 🔐 | |
| PATCH | `/notifications/settings` | 🔐 | |

Internal (not HTTP-exposed): a scheduled job (cron / BullMQ + Redis, you already have
`infrastructure/cache`) generates `LAUNDRY_REMINDER`, `SCHEDULED_OUTFIT_REMINDER`, and
`WISHLIST_PRICE_ALERT` notifications.

### 3.7 `ai` module — Phase 3 (core) / Phase 4 (advanced)

All routes go through an `aiRequestLimiter` middleware that checks `Subscription.plan`
and daily/monthly counts from `AiRequestLog` before calling the LLM/vision provider.

| Method | Route | Access | Phase | Notes |
|---|---|---|---|---|
| POST | `/ai/clothing/detect` | 🔐 | 3 | upload image → returns category/color/material/pattern/sleeve/collar/season/style/brand guess |
| POST | `/ai/clothing/:id/remove-background` | 🔐 | 3 | processes existing image, stores cleaned version |
| POST | `/ai/clothing/:id/tags` | 🔐 | 3 | auto-generate searchable tags, merges into `ClothingItem.tags` |
| POST | `/ai/outfits/suggest` | 🔐 | 3 | body: `{ occasion?, weather?, useFavoriteColors? }` → returns candidate outfits built from available (non-laundry) items |
| POST | `/ai/outfits/:id/rate` | 🔐 | 3 | → `OutfitAiRating` |
| POST | `/ai/outfits/generate` | 🔐 | 3 | body: `{ styleKeyword: "Old Money" \| "Streetwear" \| ... }` → builds outfit from wardrobe |
| POST | `/ai/weather-suggestion` | 🔐 | 3 | uses device location/forecast, suggests items |
| POST | `/ai/event-suggestion` | 🔐 | 3 | body: `{ eventDate, dressCode? }`, optionally reads calendar integration |
| POST | `/ai/chat/sessions` | 🔐 | 3 | start a stylist chat session |
| POST | `/ai/chat/sessions/:id/messages` | 🔐 | 3 | send message, get assistant reply (streamed) |
| GET | `/ai/chat/sessions/:id` | 🔐 | 3 | full transcript |
| POST | `/ai/closet/analyze` | 💎 | 4 | → `ClosetAnalysisResult[]` (donate/sell/never-worn/missing-essential/duplicate) |
| POST | `/ai/packing/generate` | 💎 | 4 | body: `{ tripName, days, tripType, destination? }` → `PackingList` |
| POST | `/ai/shopping/suggest` | 💎 | 4 | recommends items missing from wardrobe, optionally finds similar products online |
| POST | `/ai/similar-search` | 💎 | 4 | upload image → matches against user's own `ClothingItem`s |
| POST | `/ai/duplicate-detection` | 💎 | 4 | scans wardrobe for near-duplicate items |
| POST | `/ai/try-on` | 💎 | 4 | body: user photo + outfitId → generated try-on image URL |
| POST | `/ai/outfits/:id/generate-image` | 💎 | 4 | realistic outfit preview image |

### 3.8 `shopping` module (new) — Phase 4

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/shopping/wishlist` | 🔐 | `{ name, brand?, imageUrl?, productUrl?, targetPrice? }` |
| GET | `/shopping/wishlist` | 🔐 | |
| PATCH | `/shopping/wishlist/:id` | 🔐 | |
| DELETE | `/shopping/wishlist/:id` | 🔐 | |
| PATCH | `/shopping/wishlist/:id/purchased` | 🔐 | marks bought, optionally auto-creates a `ClothingItem` |
| GET | `/shopping/wishlist/:id/price-history` | 🔐 | |

Internal: a scheduled job checks tracked product prices (scraper or partner API) and
writes `PriceHistoryEntry` + fires a `WISHLIST_PRICE_ALERT` notification when
`currentPrice <= targetPrice`.

### 3.9 `social` module (new) — Phase 5

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/social/outfits/:outfitId/share` | 🔐 | creates `SharedOutfit` with public slug |
| GET | `/social/outfits/:slug` | 🔓 | public view of a shared outfit |
| PATCH | `/social/outfits/:id/visibility` | 🔐 | toggle public/private |
| POST | `/social/outfits/:id/like` | 🔐 | |
| DELETE | `/social/outfits/:id/like` | 🔐 | |
| POST | `/social/outfits/:id/comments` | 🔐 | |
| GET | `/social/outfits/:id/comments` | 🔓 | |
| DELETE | `/social/comments/:id` | 🔐 | owner or admin |
| POST | `/social/report` | 🔐 | `{ targetType, targetId, reason }` → `Report` |

### 3.10 `admin` module — Phase 5 (deepen; can start a thin version in Phase 2)

| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/admin/dashboard` | 🛡️ | high-level counts: users, premium conversion, AI usage |
| GET | `/admin/users` | 🛡️ | paginated, search/filter |
| PATCH | `/admin/users/:id/role` | 🛡️ | promote/demote |
| PATCH | `/admin/users/:id/status` | 🛡️ | activate/deactivate |
| GET | `/admin/subscriptions` | 🛡️ | |
| GET | `/admin/analytics` | 🛡️ | wardrobe growth, retention, feature usage |
| GET | `/admin/ai-usage` | 🛡️ | `AiRequestLog` aggregates by type/day |
| GET | `/admin/reports` | 🛡️ | moderation queue |
| PATCH | `/admin/reports/:id` | 🛡️ | update status |
| GET | `/admin/feature-flags` | 🛡️ | |
| PATCH | `/admin/feature-flags/:key` | 🛡️ | toggle/rollout % |

---

## 4. Module-by-module build checklist (what goes in each file)

For every module, keep the same shape you already have. Example for `wardrobe` (Phase 1):

- **`types.ts`** — `CreateClothingItemDTO`, `UpdateClothingItemDTO`, `ClothingItemFilters`, `ClothingItemResponse`
- **`validation.ts`** — Zod/Joi schemas mirroring the DTOs (category/season/occasion enums validated against Prisma enums)
- **`repository.ts`** — thin Prisma wrapper: `create`, `findMany(filters)`, `findById`, `update`, `softDelete`, `duplicate`
- **`service.ts`** — business rules: ownership checks (item belongs to `req.user.id`), image upload orchestration (calls `infrastructure/storage`), archive/favorite toggles
- **`controller.ts`** — parses request, calls service, shapes response
- **`routes.ts`** — wires controller to Express router + auth middleware
- **`constants.ts`** — pagination defaults, max images per item, allowed image mime types
- **`index.ts`** — exports the router for `src/routes/index.ts`

Apply the same breakdown to every module in the tables above.

---

## 5. Environment/services to add per phase

| Phase | New env vars / services |
|---|---|
| 1 | `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_URL` (or S3 creds), `SMTP_*` (verification/reset emails), `GOOGLE_CLIENT_ID`, `APPLE_*` |
| 2 | `REDIS_URL` (queue for reminders), Stripe/RevenueCat keys |
| 3 | LLM API key (stylist chat + suggestions), Vision API key (clothing detection), background-removal API key, weather API key |
| 4 | Try-on model API key, embeddings provider (similarity search), packing/shopping provider keys |
| 5 | none new — mostly internal logic |

---

## 6. Suggested build order (condensed)

1. **Phase 1:** `auth` → `users` (profile only) → `wardrobe` (items + images + search/filters) → `outfits` (builder only).
2. **Phase 2:** add `notifications` module + Redis queue → extend `wardrobe` with laundry status → extend `outfits` with history + calendar → add `subscriptions` (even if payment is stubbed) → add stats endpoint to `users`.
3. **Phase 3:** build out `ai` module core routes (detection, tagging, background removal, suggestions, rating, chat, weather/event) with the `AiRequestLog` limiter wired to `subscriptions`.
4. **Phase 4:** extend `ai` with try-on/closet-analysis/packing/shopping-assist/similarity/duplicate-detection; add `shopping` module (wishlist + price tracking).
5. **Phase 5:** add `social` module; deepen `admin` module (dashboard, analytics, reports, feature flags).

This keeps every phase shippable on its own — Phase 1 alone is already a usable digital wardrobe app with no AI dependency.
