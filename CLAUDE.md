# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint check
```

Перед запуском dev-сервера скопируй `.env.local.example` в `.env.local` и заполни все переменные.

## Architecture

**Ритка** — личный PWA-трекер кормления кошки. Next.js 15 App Router + Supabase + Tailwind CSS 4.

### Auth model

Авторизация на основе единственного пароля (`APP_PASSWORD` env). Два способа:
- **Browser**: cookie `ritka_session` со значением пароля — выставляется через `/api/auth` POST, проверяется в `lib/auth.ts`.
- **iPhone Shortcuts**: `Authorization: Bearer <пароль>` header напрямую в `/api/feedings` POST.

Middleware (`middleware.ts`) делает redirect незалогиненных пользователей на `/login`, но **не трогает `/api/*`** — каждый API route проверяет авторизацию самостоятельно.

### Database schema

Три SQL-файла нужно применять в Supabase SQL Editor последовательно:
1. `supabase/schema.sql` — таблицы `feedings` и `settings`
2. `supabase/purchases_schema.sql` — таблицы `purchases` и `push_subscriptions`
3. `supabase/water_schema.sql` — ALTER TABLE settings ADD COLUMN `water_changed_at`

RLS отключён на всех таблицах (приложение личное, auth на уровне Next.js).

Единственная строка в `settings` всегда имеет `id = 1` (CHECK constraint).

### API routes

| Route | Методы | Назначение |
|---|---|---|
| `/api/auth` | POST, DELETE | Логин / логаут |
| `/api/feedings` | GET, POST | Список кормлений (фильтр `?start=&end=`), добавить запись |
| `/api/feedings/[id]` | DELETE | Удалить кормление |
| `/api/feedings/bulk` | POST | Массовое добавление (режим "уезжаем") |
| `/api/purchases` | GET, POST, DELETE | История закупок корма |
| `/api/stock` | GET | Расчёт остатка корма (purchased − consumed, прогноз дней) |
| `/api/settings` | GET, PUT | Лимит сухого корма в день, время смены воды |
| `/api/water` | POST | Обновить `water_changed_at` |
| `/api/push/key` | GET | VAPID public key для подписки |
| `/api/push/subscribe` | POST | Сохранить Web Push подписку браузера |
| `/api/cron/check-feeding` | GET | Cron: проверить, покормлена ли кошка к контрольным часам |
| `/api/cron/check-stock` | GET | Cron: уведомить если запас корма заканчивается |
| `/api/status` | GET | Healthcheck |

Cron routes защищены заголовком `x-cron-secret: <CRON_SECRET>`. Время проверки кормления — **по МСК (UTC+3)**: пороги в 11:00 (20г), 16:00 (40г), 21:00 (60г).

### Frontend

Вся UI — одна страница `app/dashboard/page.tsx` (`"use client"`). Данные загружаются через `fetch` к собственным API routes. Навигация по датам — state `date: Date`.

Компоненты в `components/`:
- `FeedingForm` / `FeedingList` — добавление и просмотр кормлений
- `DryProgress` — прогресс-бар суточного лимита сухого корма
- `StockWidget` / `PurchaseModal` / `PurchaseHistory` — учёт запасов
- `WaterWidget` — отслеживание смены воды
- `BulkFeedingModal` — массовое добавление кормлений заранее
- `SettingsModal` — изменение дневного лимита

### Web Push

`lib/webpush.ts` использует `web-push` (VAPID). Подписки хранятся в таблице `push_subscriptions`. При отправке уведомления протухшие подписки (HTTP 410/404) автоматически удаляются из БД.

VAPID-ключи генерируются один раз командой `npx web-push generate-vapid-keys` и прописываются в env.

### Environment variables

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key Supabase |
| `APP_PASSWORD` | Единственный пароль для доступа |
| `VAPID_PUBLIC_KEY` | VAPID public key для Web Push |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_EMAIL` | Контактный email для VAPID (`mailto:...`) |
| `CRON_SECRET` | Секрет для защиты cron endpoints |
