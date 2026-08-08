-- Mehmonlar javoblari uchun jadval (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS rsvp (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  vid         TEXT    NOT NULL UNIQUE,          -- mehmon brauzerining doimiy belgisi
  name        TEXT    NOT NULL,
  answer      TEXT    NOT NULL CHECK (answer IN ('yes','no')),
  at          TEXT    NOT NULL,                 -- javob berilgan payt (ISO)
  ip          TEXT,
  ua          TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rsvp_created ON rsvp (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_ip      ON rsvp (ip, created_at);
