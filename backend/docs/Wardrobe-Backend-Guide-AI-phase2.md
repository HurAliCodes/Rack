# Digital Wardrobe — Phase 3 Backend Guide
### `ai` module: AI outfit suggestions, AI outfit generator, LLM stylist chatbot + a few extras

Builds on top of the `auth` / `users` / `wardrobe` / `outfits` modules from Phase 1 & 2.
Nothing in those modules changes — this phase only adds one new module.

```
src/modules/ai/
  ├── constants.ts
  ├── controller.ts
  ├── index.ts
  ├── repository.ts
  ├── routes.ts
  ├── service.ts
  ├── types.ts
  ├── validation.ts
  └── llm/
       ├── client.ts       ← wraps the LLM API call
       ├── tools.ts         ← wardrobe "function calling" tool definitions
       └── prompts.ts       ← system prompts per feature
```

---

## 1. What's in this phase

| Feature | Route(s) | What it does |
|---|---|---|
| AI Clothing Detection | `POST /ai/clothing/detect` | upload a photo → AI fills in category/color/material/pattern/season/style |
| AI Auto-Tagging | `POST /ai/clothing/:id/tags` | generates searchable tags for an existing item |
| AI Outfit Suggestions | `POST /ai/outfits/suggest` | "what should I wear" — builds outfit candidates from what's actually in the wardrobe |
| AI Outfit Generator | `POST /ai/outfits/generate` | user types a vibe ("Old Money", "Streetwear") → AI assembles an outfit from owned items |
| AI Outfit Rating | `POST /ai/outfits/:id/rate` | scores an existing outfit (color harmony, style, formality, seasonal fit) with an explanation |
| AI Weather Suggestion | `POST /ai/weather-suggestion` | pulls forecast, suggests what to wear today |
| AI Stylist Chatbot | `POST /ai/chat/sessions`, `POST /ai/chat/sessions/:id/messages` | free-form chat ("what matches this shirt?", "is this good for an interview?") — this is your "personal AI," grounded in the user's actual wardrobe, not generic advice |

Deliberately **not** in this phase (add later, same pattern): virtual try-on, AI-generated outfit preview images, closet analysis (donate/sell suggestions), packing assistant, duplicate detection, similar-item image search. These all need either an image-generation model or heavier vision pipelines — cleaner as their own phase once the text/LLM plumbing here is proven out.

---

## 2. The core idea: this is not a generic chatbot

The most important design decision in this module: **the AI never guesses what's in the
user's wardrobe — it looks it up.** Every AI feature is a thin prompt wrapper around
your existing `wardrobe`/`outfits` repositories, using tool/function calling so the model
can only recommend things the user actually owns.

```
User message
   │
   ▼
ai/service.ts
   │  1. loads user's available wardrobe (excludes laundry/archived items)
   │  2. calls llm/client.ts with the message + tool definitions
   ▼
LLM decides: "I need to see their jackets" → calls get_clothing_items({ category: "JACKET" })
   │
   ▼
ai/llm/tools.ts executes the tool against wardrobe/repository.ts (read-only)
   │
   ▼
Result fed back to the LLM → final natural-language answer, referencing real item IDs
```

This is what makes "AI outfit suggestions" and the chatbot trustworthy instead of making things up — the model is reasoning over real rows in your `ClothingItem` table, not hallucinating a wardrobe.

---

## 3. Prisma Schema Additions

Add these models to `prisma/schema.prisma` (everything from Phase 1/2 stays as-is):

```prisma
// =========================================================
// AI MODULE
// =========================================================

enum AiRequestType {
  CLOTHING_DETECTION
  AUTO_TAGGING
  OUTFIT_SUGGESTION
  OUTFIT_GENERATOR
  OUTFIT_RATING
  WEATHER_SUGGESTION
  STYLIST_CHAT
}

// Every AI call is logged — powers simple usage limits now, and premium gating later
// once the `subscriptions` module exists (no schema change needed for that).
model AiRequestLog {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          AiRequestType
  inputSummary  Json?
  outputSummary Json?
  toolCalls     Json?         // which wardrobe tools the LLM invoked, for debugging
  tokensUsed    Int?
  success       Boolean       @default(true)
  errorMessage  String?
  createdAt     DateTime      @default(now())

  @@index([userId, type, createdAt])
}

model AiChatSession {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?         // auto-generated from first message
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
  toolCalls Json?         // record of any wardrobe lookups made to answer this message
  createdAt DateTime      @default(now())

  @@index([sessionId])
}

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
```

Also add the reverse relations on the existing `User` and `Outfit` models:

```prisma
model User {
  // ...existing fields
  aiChatSessions AiChatSession[]
  aiRequestLogs  AiRequestLog[]
}

model Outfit {
  // ...existing fields
  aiRatings OutfitAiRating[]
}
```

Also mark AI-generated outfits so the UI can badge them:

```prisma
model Outfit {
  // ...existing fields
  isAiGenerated Boolean @default(false)
}
```

And let AI-suggested tags merge into the item without a new table — reuse the `tags String[]` field already on `ClothingItem` from earlier phases. If you skipped adding it in Phase 1, add now:

```prisma
model ClothingItem {
  // ...existing fields
  tags String[] @default([])
}
```

---

## 4. API Reference

Access legend: 🔐 Authenticated user. All routes go through an `aiUsageLimiter` middleware
(see §6) that checks `AiRequestLog` counts before calling the LLM.

### 4.1 Clothing detection & tagging

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/ai/clothing/detect` | multipart image | `{ category, color, material, pattern, season, style, brandGuess, confidence }` — pre-fills the "add clothing" form, user still confirms/edits before saving |
| POST | `/ai/clothing/:id/tags` | — | `{ tags: string[] }` — merged into `ClothingItem.tags` |

### 4.2 Outfit suggestions & generation

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/ai/outfits/suggest` | `{ occasion?, useFavoriteColors?, count? }` | array of outfit candidates, each `{ items: ClothingItem[], reasoning: string }` — built only from non-laundry, non-archived items |
| POST | `/ai/outfits/generate` | `{ styleKeyword: string }` e.g. `"Old Money"`, `"Streetwear"`, `"Business Casual"` | one assembled outfit `{ items: ClothingItem[], reasoning: string }`; user can then `POST /outfits` to save it (`isAiGenerated: true`) |
| POST | `/ai/outfits/:id/rate` | — | `OutfitAiRating` |

### 4.3 Weather

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/ai/weather-suggestion` | `{ lat, lng }` or `{ city }` | `{ forecastSummary, suggestedItems: ClothingItem[], reasoning }` |

### 4.4 Stylist chatbot

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/ai/chat/sessions` | `{}` | `{ sessionId }` — creates an empty session |
| GET | `/ai/chat/sessions` | — | list of the user's sessions (id, title, updatedAt) |
| GET | `/ai/chat/sessions/:id` | — | full transcript |
| POST | `/ai/chat/sessions/:id/messages` | `{ content: string }` | assistant reply; supports streaming (`text/event-stream`) if your frontend wants it |
| DELETE | `/ai/chat/sessions/:id` | — | delete session + messages |

Typical chat questions this should handle well because of the tool-calling design:
*"What should I wear tomorrow?"*, *"What matches this blue shirt?"*, *"Which shoes go with this outfit?"*, *"Is this good for a job interview?"*, *"What should I pack for a 3-day trip?"* (packing itself is Phase 4, but the chatbot can already reason about it using existing wardrobe tools).

---

## 5. LLM integration design

### 5.1 `llm/tools.ts` — the wardrobe "function calling" surface

Give the model a small, read-only toolset. It should never be able to write to the database directly — only your `service.ts` writes, after the model returns its final answer.

```ts
export const wardrobeTools = [
  {
    name: "get_clothing_items",
    description: "Search the user's wardrobe. Only returns items that are available (not archived, not in laundry) unless includeUnavailable is true.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: CLOTHING_CATEGORIES },
        color: { type: "string" },
        season: { type: "string", enum: SEASONS },
        occasion: { type: "string", enum: OCCASIONS },
        favoriteOnly: { type: "boolean" },
        includeUnavailable: { type: "boolean" },
      },
    },
  },
  {
    name: "get_outfit",
    description: "Fetch a specific saved outfit and its items by id.",
    input_schema: {
      type: "object",
      properties: { outfitId: { type: "string" } },
      required: ["outfitId"],
    },
  },
  {
    name: "get_recent_wear_history",
    description: "See what the user has worn recently, to avoid repeating outfits.",
    input_schema: {
      type: "object",
      properties: { days: { type: "number" } },
    },
  },
] as const;
```

### 5.2 `llm/client.ts` — the actual API call

```ts
export async function callStylistLLM(params: {
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  userId: string;
}) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: params.systemPrompt,
      messages: params.messages,
      tools: wardrobeTools,
    }),
  });

  const data = await response.json();

  // If the model asked to use a tool, execute it against the real wardrobe
  // repository (scoped to params.userId), append the tool_result, and call again.
  // Loop until the model returns a final text-only response.
  return resolveToolLoop(data, params.userId);
}
```

`resolveToolLoop` is the important bit: whenever `data.content` contains a
`tool_use` block, call the matching function in `wardrobeTools`'s executor
(against `wardrobe/repository.ts`, always filtered by `userId` — never trust
the model to scope this itself), append a `tool_result` message, and re-call
the API. Stop when the model responds with only `text` blocks.

### 5.3 `llm/prompts.ts` — one system prompt per feature

Keep prompts feature-specific rather than one giant prompt:

- **Stylist chat**: "You are a personal stylist. You only recommend items the user owns — always use `get_clothing_items` before suggesting anything. Never invent items."
- **Outfit suggest / generate**: adds explicit output-format instructions (must return structured JSON matching `{ items: [...], reasoning }`) since this one isn't a free chat.
- **Outfit rating**: asks for the four numeric scores + explanation in strict JSON.

For any endpoint that needs structured output (suggest, generate, rate, detect, tag), instruct the model to return **JSON only, no prose, no markdown fences** and parse it server-side with a try/catch — same pattern as any structured-output LLM call.

---

## 6. Usage limiting (without full subscriptions yet)

You don't have the `subscriptions` module wired up yet, so keep this simple for now:

```ts
// ai/constants.ts
export const DAILY_AI_REQUEST_LIMIT = 20; // flat limit for every user, for now
```

```ts
// ai/service.ts (pseudocode)
const todayCount = await aiRequestLogRepository.countSince(userId, startOfToday());
if (todayCount >= DAILY_AI_REQUEST_LIMIT) {
  throw new AppError(429, "Daily AI limit reached, try again tomorrow");
}
```

When you build the `subscriptions` module later, swap the flat constant for a
plan-based lookup (`FREE: 20/day`, `PREMIUM: unlimited`) — the `AiRequestLog`
table already has everything needed for that, no migration required.

---

## 7. Module file breakdown

- **`types.ts`** — `DetectClothingRequest/Response`, `SuggestOutfitRequest/Response`, `GenerateOutfitRequest/Response`, `RateOutfitResponse`, `ChatMessageRequest/Response`
- **`validation.ts`** — validate image mime/size for detection, validate `styleKeyword` length, validate chat `content` length (avoid empty/huge prompts)
- **`repository.ts`** — `AiRequestLog` and `AiChatSession`/`AiChatMessage` CRUD only (never touches `ClothingItem`/`Outfit` directly — that goes through the wardrobe/outfits repositories via the tools)
- **`service.ts`** — orchestrates: check usage limit → build prompt → call `llm/client.ts` → parse response → log to `AiRequestLog` → return
- **`controller.ts`** — parses request (including multipart for detection), calls service, shapes response
- **`routes.ts`** — wires controller to Express router + auth + `aiUsageLimiter` middleware
- **`constants.ts`** — `DAILY_AI_REQUEST_LIMIT`, model name, max chat message length
- **`index.ts`** — exports router for `src/routes/index.ts`

---

## 8. Env vars to add

```
ANTHROPIC_API_KEY=
WEATHER_API_KEY=            # for /ai/weather-suggestion (e.g. OpenWeather)
```

No new infra needed — reuse `infrastructure/storage` for the detection endpoint's image upload, and your existing Redis (if added in Phase 2) is optional here — only useful if you later want to stream/queue AI jobs instead of handling them synchronously.

---

## 9. Build order for this phase

1. `llm/client.ts` + `llm/tools.ts` — get one working tool-calling round trip against a test wardrobe, before wiring any routes.
2. `POST /ai/chat/sessions` + `POST /ai/chat/sessions/:id/messages` — the chatbot is the best way to validate the tool-calling loop end-to-end, and every other feature reuses the same client.
3. `POST /ai/outfits/suggest` — structured-output version of the same pattern.
4. `POST /ai/outfits/generate` — same shape as suggest, different prompt.
5. `POST /ai/outfits/:id/rate` — structured JSON, simplest of the bunch.
6. `POST /ai/clothing/detect` + `POST /ai/clothing/:id/tags` — vision-capable prompt (send image as base64), same JSON-output pattern.
7. `POST /ai/weather-suggestion` — pull forecast, feed into the suggest prompt.

Once this is solid, virtual try-on / closet analysis / packing assistant (Phase 4) reuse the exact same `llm/client.ts` — they just add new tools and prompts.
