# План реализации: Вкусняшки, Статистика и Здоровье

## 1. Изменения в базе данных (Supabase SQL)

Для реализации потребуется выполнить следующие SQL-запросы в SQL Editor:

```sql
-- 1. Поддержка дробных значений для вкусняшек (0.3 и т.д.)
ALTER TABLE feedings ALTER COLUMN amount_grams TYPE NUMERIC;

-- 2. Добавление цены в таблицу закупок
ALTER TABLE purchases ADD COLUMN price NUMERIC(10, 2) DEFAULT 0;

-- 3. Создание таблицы процедур для раздела Здоровье
CREATE TABLE procedures (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title        TEXT        NOT NULL, -- Название (прививка, глистогонка и т.д.)
  description  TEXT,                 -- Детали
  cost         NUMERIC(10, 2) DEFAULT 0, -- Стоимость для статистики трат
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE procedures DISABLE ROW LEVEL SECURITY;
```

## 2. Обновление API (Next.js Routes)

### `/api/purchases`
*   **GET**: Добавить возвращение поля `price`.
*   **POST**: Принимать `price` при сохранении новой закупки.

### `/api/procedures` [NEW]
*   **GET**: Получение списка всех процедур.
*   **POST**: Добавление новой записи (название, дата, описание, стоимость).
*   **DELETE**: Удаление записи.

### `/api/stats/spending` [NEW]
*   **GET**: Эндпоинт для агрегации данных из `purchases` и `procedures`. Группировка по месяцам (на основе `purchased_at` и `performed_at`), расчет итоговых сумм.

## 3. Обновление типов (`lib/types.ts`)

*   **Purchase**: добавить `price: number`.
*   **Feeding**: учесть, что `amount_grams` теперь `number` (float) и для типа `treat` интерпретируется как «штуки».
*   **Procedure** [NEW]: `id`, `performed_at`, `title`, `description`, `cost`.

## 4. Фронтенд компоненты (UI)

### Формы:
*   **FeedingForm**: При выборе `food_type === 'treat'` менять лейбл с «грамм» на «шт.» и устанавливать `step="0.1"` для инпута.
*   **PurchaseModal**: Добавить поле «Цена».

### Раздел «Здоровье» (Health Section):
*   Новая вкладка/секция в Dashboard.
*   **ProcedureList**: Список всех процедур, сгруппированный по дате (вид календаря-лога).
*   **ProcedureForm**: Форма добавления записи (Title, Date, Cost, Description).

### Статистика:
*   **SpendingStats**: Список по месяцам.
    *   *Пример: Май 2024 — 4500 ₽ (Корм: 3000, Процедуры: 1500).*

## 5. Проверка
*   Расчет остатка сухого корма (`api/stock`) должен продолжать учитывать только `dry`.
*   Суммирование трат должно корректно объединять данные из разных таблиц.
