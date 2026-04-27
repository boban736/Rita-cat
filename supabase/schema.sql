-- Таблица кормлений
CREATE TABLE feedings (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  fed_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  amount_grams INTEGER   NOT NULL CHECK (amount_grams > 0),
  food_type  TEXT        NOT NULL CHECK (food_type IN ('dry', 'treat', 'home')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Настройки (одна строка)
CREATE TABLE settings (
  id               INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  dry_limit_grams  INTEGER NOT NULL DEFAULT 60 CHECK (dry_limit_grams > 0),
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Начальные настройки
INSERT INTO settings (id, dry_limit_grams) VALUES (1, 60);

-- Индекс для быстрой выборки по дате
CREATE INDEX feedings_fed_at_idx ON feedings (fed_at DESC);

-- Отключить RLS (личное приложение, auth на уровне Next.js)
ALTER TABLE feedings DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
