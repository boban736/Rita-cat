-- Закупки корма
CREATE TABLE purchases (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  amount_grams INTEGER     NOT NULL CHECK (amount_grams > 0)
);

ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;

-- Push-подписки браузера
CREATE TABLE push_subscriptions (
  id         UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint   TEXT  NOT NULL UNIQUE,
  p256dh     TEXT  NOT NULL,
  auth       TEXT  NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
