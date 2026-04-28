# Ритка — Трекер кормления кошки

## Деплой

### 1. Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. Открой **SQL Editor** и выполни файл `supabase/schema.sql`
3. Скопируй из **Settings → API**:
   - `Project URL`
   - `anon public` key

### 2. Vercel

1. Залей проект на GitHub
2. Импортируй в [vercel.com](https://vercel.com)
3. Добавь переменные окружения:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
APP_PASSWORD=твой_пароль
```

4. Деплой готов.

---

## cron-job.org

Создай 2 задачи на [cron-job.org](https://cron-job.org):

**Проверка кормления** (запускать в 11:00, 16:00, 21:00 МСК = 08:00, 13:00, 18:00 UTC):
- URL: `https://твой-домен.vercel.app/api/cron/check-feeding`
- Method: `GET`
- Header: `x-cron-secret: <значение CRON_SECRET из .env>`
- Schedule: `0 8,13,18 * * *`

**Проверка запасов** (раз в день, 12:00 МСК = 09:00 UTC):
- URL: `https://твой-домен.vercel.app/api/cron/check-stock`
- Method: `GET`
- Header: `x-cron-secret: <значение CRON_SECRET из .env>`
- Schedule: `0 9 * * *`

---

## iPhone Shortcuts

Создай Shortcut с шагами:

1. **Ask for Input** → "Сколько грамм?" → запиши в переменную `grams`
2. **Choose from List** → `["dry", "treat", "home"]` → переменная `type`
3. **Get Contents of URL**:
   - URL: `https://твой-домен.vercel.app/api/feedings`
   - Method: `POST`
   - Headers: `Authorization: Bearer твой_пароль`, `Content-Type: application/json`
   - Body (JSON): `{"amount_grams": [grams], "food_type": "[type]"}`

---

## Локальная разработка

```bash
cp .env.local.example .env.local
# заполни .env.local

npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)
