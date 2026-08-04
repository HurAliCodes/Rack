backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── cache/
│   │   ├── logger/
│   │   └── storage/
│   │
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── wardrobe/
│   │   ├── outfits/
│   │   ├── ai/
│   │   ├── subscriptions/
│   │   ├── notifications/
│   │   └── admin/
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── docker/
├── package.json
├── tsconfig.json
├── .env
├── .env.example
└── README.md