# Digital Wardrobe — Simple Backend Build Guide
### Auth + Wardrobe + Outfits only (no AI, no shopping, no social)

Matches your existing module structure — you'll only need 3 modules for this:

```
src/modules/{auth, users, wardrobe, outfits}
  ├── constants.ts
  ├── controller.ts
  ├── index.ts
  ├── repository.ts
  ├── routes.ts
  ├── service.ts
  ├── types.ts
  └── validation.ts
```

`admin`, `ai`, `subscriptions` — leave the folders empty/unused for now. Nothing here depends on them.

---

## 1. Build Order

| Step | Module | What you get |
|---|---|---|
| 1 | `auth` | register, login, sessions |
| 2 | `users` | profile (name, avatar, sizes, preferences) |
| 3 | `wardrobe` | add/edit/delete clothes, images, categories, search, filters, favorites, laundry status |
| 4 | `outfits` | build outfits from wardrobe items, favorite them, log what was worn, schedule outfits on a calendar |

Each step is fully usable on its own — you can stop after step 3 and already have a working digital wardrobe with no outfit builder.

---

## 2. Prisma Schema

Copy into `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =========================================================
// AUTH
// =========================================================

enum AuthProvider {
  LOCAL
  GOOGLE
  APPLE
}

model User {
  id                String       @id @default(cuid())
  email             String       @unique
  passwordHash      String?      // null if OAuth-only
  provider          AuthProvider @default(LOCAL)
  providerId        String?
  isEmailVerified   Boolean      @default(false)
  emailVerifiedAt   DateTime?
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  profile            Profile?
  refreshTokens      RefreshToken[]
  passwordResets     PasswordResetToken[]
  emailVerifications EmailVerificationToken[]

  clothingItems    ClothingItem[]
  outfits          Outfit[]
  outfitHistory    OutfitHistoryEntry[]
  scheduledOutfits ScheduledOutfit[]

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
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

model EmailVerificationToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
}

// =========================================================
// USERS (profile)
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
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String?
  avatarUrl      String?
  gender         Gender?  @default(UNSPECIFIED)
  heightCm       Float?
  weightKg       Float?
  preferredStyle String?
  favoriteColors String[] @default([])
  clothingSizes  Json?    // { top: "M", bottom: "32", shoe: "10" }
  theme          Theme    @default(SYSTEM)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// =========================================================
// WARDROBE
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

enum LaundryStatus {
  AVAILABLE
  DIRTY
  WASHING
  DRYING
  MISSING
}

model ClothingItem {
  id            String           @id @default(cuid())
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  name          String
  category      ClothingCategory
  brand         String?
  color         String?
  pattern       String?
  material      String?
  season        Season?          @default(ALL_SEASON)
  occasion      Occasion?
  size          String?
  purchaseDate  DateTime?
  purchasePrice Decimal?         @db.Decimal(10, 2)
  notes         String?

  isFavorite    Boolean          @default(false)
  isArchived    Boolean          @default(false)
  laundryStatus LaundryStatus    @default(AVAILABLE)

  lastWornAt    DateTime?
  wearCount     Int              @default(0)

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  images         ClothingImage[]
  outfitItems    OutfitItem[]
  historyEntries OutfitHistoryEntry[] @relation("HistoryClothingItems")

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
// OUTFITS
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
  id         String         @id @default(cuid())
  userId     String
  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String
  category   OutfitCategory @default(CUSTOM)
  isFavorite Boolean        @default(false)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  items            OutfitItem[]
  historyEntries   OutfitHistoryEntry[]
  scheduledEntries ScheduledOutfit[]

  @@index([userId])
}

model OutfitItem {
  id             String       @id @default(cuid())
  outfitId       String
  outfit         Outfit       @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  clothingItemId String
  clothingItem   ClothingItem @relation(fields: [clothingItemId], references: [id], onDelete: Cascade)
  layerOrder     Int          @default(0) // drag & drop stacking order

  @@unique([outfitId, clothingItemId])
  @@index([outfitId])
}

model OutfitHistoryEntry {
  id            String         @id @default(cuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitId      String?
  outfit        Outfit?        @relation(fields: [outfitId], references: [id], onDelete: SetNull)
  wornDate      DateTime
  notes         String?
  clothingItems ClothingItem[] @relation("HistoryClothingItems")
  createdAt     DateTime       @default(now())

  @@index([userId, wornDate])
}

model ScheduledOutfit {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitId     String
  outfit       Outfit   @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  scheduledFor DateTime
  createdAt    DateTime @default(now())

  @@index([userId, scheduledFor])
}
```

---

## 3. API Reference

Access legend: 🔓 Public · 🔐 Authenticated user

### 3.1 `auth`

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | email + password, sends verification email |
| POST | `/auth/login` | 🔓 | returns access + refresh token |
| POST | `/auth/logout` | 🔐 | revokes refresh token |
| POST | `/auth/refresh` | 🔓 | rotate refresh token → new access token |
| POST | `/auth/forgot-password` | 🔓 | issues reset token, emails link |
| POST | `/auth/reset-password` | 🔓 | consumes token, sets new password |
| GET | `/auth/verify-email/:token` | 🔓 | consumes verification token |
| POST | `/auth/resend-verification` | 🔐 | rate-limited |
| POST | `/auth/google` | 🔓 | verify Google ID token, create/find user |
| POST | `/auth/apple` | 🔓 | verify Apple identity token (mobile) |
| GET | `/auth/me` | 🔐 | current session's user |

### 3.2 `users` (profile)

| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/users/me/profile` | 🔐 | full profile |
| PATCH | `/users/me/profile` | 🔐 | name, avatar, height, weight, style, colors, sizes |
| PATCH | `/users/me/theme` | 🔐 | light/dark/system |
| DELETE | `/users/me` | 🔐 | soft delete (`isActive=false`) |
| GET | `/users/me/stats` | 🔐 | total clothes, category breakdown, favorites, most/least worn, wardrobe value, cost-per-wear, recent additions — pure aggregation query over `ClothingItem` + `OutfitHistoryEntry`, no extra table needed |

### 3.3 `wardrobe`

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/wardrobe/items` | 🔐 | create clothing item (multipart images) |
| GET | `/wardrobe/items` | 🔐 | query: `category, color, brand, season, occasion, favorite, availability, sort, page, limit` |
| GET | `/wardrobe/items/:id` | 🔐 | |
| PATCH | `/wardrobe/items/:id` | 🔐 | edit any field |
| DELETE | `/wardrobe/items/:id` | 🔐 | |
| POST | `/wardrobe/items/:id/duplicate` | 🔐 | |
| PATCH | `/wardrobe/items/:id/archive` | 🔐 | toggle `isArchived` |
| PATCH | `/wardrobe/items/:id/favorite` | 🔐 | toggle `isFavorite` |
| GET | `/wardrobe/search?q=` | 🔐 | search name/category/brand/color/pattern/material/season/occasion |
| POST | `/wardrobe/items/:id/images` | 🔐 | upload (multiple), via `infrastructure/storage` |
| PATCH | `/wardrobe/items/:id/images/:imageId` | 🔐 | crop/rotate/replace/set-cover |
| DELETE | `/wardrobe/items/:id/images/:imageId` | 🔐 | |
| PATCH | `/wardrobe/items/:id/laundry-status` | 🔐 | available/dirty/washing/drying/missing |
| GET | `/wardrobe/laundry?status=` | 🔐 | list by status |

### 3.4 `outfits`

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/outfits` | 🔐 | `{ name, category, itemIds: [{clothingItemId, layerOrder}] }` |
| GET | `/outfits` | 🔐 | filter by category, favorite |
| GET | `/outfits/:id` | 🔐 | includes items with clothing details |
| PATCH | `/outfits/:id` | 🔐 | rename, change category/items |
| DELETE | `/outfits/:id` | 🔐 | |
| POST | `/outfits/:id/duplicate` | 🔐 | |
| PATCH | `/outfits/:id/favorite` | 🔐 | |
| POST | `/outfits/history` | 🔐 | log a worn outfit (`outfitId` optional, or raw `clothingItemIds`) — updates `lastWornAt`/`wearCount` on items |
| GET | `/outfits/history?from=&to=` | 🔐 | |
| POST | `/outfits/schedule` | 🔐 | `{ outfitId, scheduledFor }` |
| GET | `/outfits/schedule?month=` | 🔐 | calendar view |
| DELETE | `/outfits/schedule/:id` | 🔐 | |

---

## 4. What each module file holds

Same pattern for every module — example for `wardrobe`:

- **`types.ts`** — `CreateClothingItemDTO`, `UpdateClothingItemDTO`, `ClothingItemFilters`, `ClothingItemResponse`
- **`validation.ts`** — schema validation mirroring the DTOs (category/season/occasion validated against the Prisma enums)
- **`repository.ts`** — thin Prisma wrapper: `create`, `findMany(filters)`, `findById`, `update`, `softDelete`, `duplicate`
- **`service.ts`** — ownership checks (item belongs to `req.user.id`), image upload orchestration, archive/favorite toggles
- **`controller.ts`** — parses request, calls service, shapes response
- **`routes.ts`** — wires controller to Express router + auth middleware
- **`constants.ts`** — pagination defaults, max images per item, allowed image mime types
- **`index.ts`** — exports the router for `src/routes/index.ts`

---

## 5. Env vars needed

```
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_URL=            # or AWS S3 creds
SMTP_HOST= / SMTP_USER= / SMTP_PASS=   # verification + reset emails
GOOGLE_CLIENT_ID=
APPLE_CLIENT_ID= / APPLE_TEAM_ID= / APPLE_KEY_ID= / APPLE_PRIVATE_KEY=
```

No Redis, no LLM/vision API keys, no payment provider keys needed for this scope.

---

## 6. What's deliberately left out (add later, separately)

- AI features (`ai` module) — detection, tagging, stylist chat, suggestions, try-on
- `subscriptions` — premium gating
- `shopping` — wishlist, price tracking
- `social` — sharing, likes, comments
- `admin` panel depth, `notifications` module

None of the schema or routes above need to change to add these later — they're pure additions.
