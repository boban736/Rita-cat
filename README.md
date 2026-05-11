# Ритка

PWA-трекер для кормления кошки. Записываешь сколько и что съела — приложение считает дневной лимит сухого корма, следит за запасами и шлёт push-уведомления если кошку забыли покормить.

## Что умеет

- Кормления: сухой корм, лакомства, домашняя еда
- Прогресс-бар дневного лимита сухого корма
- Учёт закупок и прогноз на сколько хватит запасов
- Напоминание сменить воду
- Push-уведомления если кошка не покормлена к 11:00 / 16:00 / 21:00 МСК
- Режим "уезжаем" — добавить кормления наперёд
- Работает как PWA — добавляется на экран телефона
- iPhone Shortcut для быстрой записи без открытия браузера

## Стек

- Next.js 15 App Router
- Supabase (PostgreSQL)
- Tailwind CSS 4
- Web Push (VAPID)

## Локальная разработка

```bash
cp .env.local.example .env.local
# заполни переменные в .env.local
npm install
npm run dev
```

Откроется на http://localhost:3000.

## Переменные окружения

| Переменная | Описание |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key из Settings → API |
| `APP_PASSWORD` | пароль для входа |
| `VAPID_PUBLIC_KEY` | VAPID public key |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_EMAIL` | контактный email для VAPID (`mailto:...`) |
| `CRON_SECRET` | секрет для защиты cron endpoints |

Сгенерировать VAPID-ключи: `npx web-push generate-vapid-keys`

## База данных

Три SQL-файла, применять последовательно в Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/purchases_schema.sql`
3. `supabase/water_schema.sql`

## Деплой

Инструкции по Vercel, cron-job.org и iPhone Shortcuts — в [SETUP.md](./SETUP.md).
