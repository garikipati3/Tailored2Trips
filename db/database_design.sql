
-- Tailored2Trips — PostgreSQL DDL (v1)
-- Schema focuses on core features: users, trips, itinerary, reviews, budgets, security, group planning,
-- preferences, achievements, notifications, and integrations.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) USERS & AUTH -------------------------------------------------------------
CREATE TABLE app_user (
  user_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             CITEXT UNIQUE NOT NULL,
  username          CITEXT UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  full_name         TEXT,
  bio               TEXT,
  profile_photo_url TEXT,
  locale            TEXT DEFAULT 'en-US',
  currency          CHAR(3) DEFAULT 'USD',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_security (
  user_id           UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
  has_2fa           BOOLEAN NOT NULL DEFAULT FALSE,
  totp_secret       TEXT,
  backup_codes_hash TEXT[],
  last_password_reset_at TIMESTAMPTZ
);

CREATE TABLE user_session (
  session_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at        TIMESTAMPTZ NOT NULL,
  user_agent        TEXT,
  ip_addr           INET
);

CREATE TABLE oauth_account (
  oauth_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  provider          TEXT NOT NULL, -- e.g., google, github
  provider_user_id  TEXT NOT NULL,
  UNIQUE (provider, provider_user_id)
);

-- 2) PREFERENCES & SETTINGS ---------------------------------------------------
CREATE TABLE user_preferences (
  user_id           UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
  travel_styles     TEXT[],     -- e.g., '{beach,nightlife,foodie}'
  interests         TEXT[],     -- tags: 'hiking','museums'
  budget_min        INTEGER,    -- in smallest currency unit (e.g., cents)
  budget_max        INTEGER,
  home_airport      TEXT,
  languages         TEXT[],
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push  BOOLEAN DEFAULT TRUE,
  theme             TEXT DEFAULT 'system'
);

-- 3) PLACES & EXTERNAL DATA ---------------------------------------------------
CREATE TABLE place (
  place_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  category          TEXT NOT NULL, -- 'attraction','restaurant','hotel','trail','city','poi'
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,
  address           TEXT,
  city              TEXT,
  country_code      CHAR(2),
  external_ref      JSONB,         -- {google_place_id: "...", skyscanner_id: "...", airbnb_id: "..."}
  rating_avg        NUMERIC(3,2),
  rating_count      INTEGER DEFAULT 0
);

CREATE INDEX place_geo_idx ON place USING gist (POINT(lng, lat));

-- 4) TRIPS & GROUP COLLAB -----------------------------------------------------
CREATE TYPE trip_visibility AS ENUM ('private','unlisted','public');

CREATE TABLE trip (
  trip_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  start_date        DATE,
  end_date          DATE,
  origin_city       TEXT,
  destination_city  TEXT,
  total_budget_cents INTEGER,
  visibility        trip_visibility NOT NULL DEFAULT 'private',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE trip_role AS ENUM ('owner','editor','viewer');

CREATE TABLE trip_member (
  trip_id           UUID NOT NULL REFERENCES trip(trip_id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  role              trip_role NOT NULL DEFAULT 'viewer',
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (trip_id, user_id)
);

-- Group chat for trip collaboration
CREATE TABLE trip_message (
  message_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id           UUID NOT NULL REFERENCES trip(trip_id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) ITINERARY (DAYS & ITEMS) -------------------------------------------------
CREATE TABLE itinerary_day (
  day_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id           UUID NOT NULL REFERENCES trip(trip_id) ON DELETE CASCADE,
  day_number        INTEGER NOT NULL,       -- 1..N within the trip
  date              DATE,
  UNIQUE (trip_id, day_number)
);

CREATE TYPE item_type AS ENUM ('flight','lodging','activity','transport','meal','buffer');

CREATE TABLE itinerary_item (
  item_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id            UUID NOT NULL REFERENCES itinerary_day(day_id) ON DELETE CASCADE,
  sort_order        INTEGER NOT NULL DEFAULT 1,
  type              item_type NOT NULL,
  title             TEXT NOT NULL,
  notes             TEXT,
  start_time        TIMESTAMPTZ,
  end_time          TIMESTAMPTZ,
  place_id          UUID REFERENCES place(place_id),
  est_cost_cents    INTEGER,
  booking_status    TEXT, -- 'planned','booked','cancelled'
  external_booking  JSONB, -- raw API payloads/refs (PNR, booking_id, confirmation #)
  explainability    JSONB  -- {rationale: "...", factors: ["budget","weather","nearby"]}
);

CREATE INDEX itinerary_item_day_idx ON itinerary_item(day_id, sort_order);

-- 6) BOOKINGS (FLIGHTS / LODGING / ACTIVITIES) --------------------------------
CREATE TABLE booking (
  booking_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id           UUID UNIQUE NOT NULL REFERENCES itinerary_item(item_id) ON DELETE CASCADE,
  provider          TEXT NOT NULL, -- 'skyscanner','booking','airbnb'
  provider_ref      TEXT NOT NULL,
  status            TEXT NOT NULL, -- 'held','booked','cancelled','refunded'
  price_cents       INTEGER,
  currency          CHAR(3) DEFAULT 'USD',
  booked_at         TIMESTAMPTZ DEFAULT now()
);

-- 7) BUDGETS & COSTS ----------------------------------------------------------
CREATE TABLE cost_category (
  code              TEXT PRIMARY KEY, -- 'flight','lodging','food','transport','activity','misc'
  label             TEXT NOT NULL
);

INSERT INTO cost_category(code,label) VALUES
('flight','Flights') ON CONFLICT DO NOTHING;

CREATE TABLE trip_budget_line (
  line_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id           UUID NOT NULL REFERENCES trip(trip_id) ON DELETE CASCADE,
  category_code     TEXT NOT NULL REFERENCES cost_category(code),
  planned_cents     INTEGER NOT NULL DEFAULT 0,
  actual_cents      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (trip_id, category_code)
);

-- 8) REVIEWS & RATINGS --------------------------------------------------------
CREATE TABLE review (
  review_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id         UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  target_type       TEXT NOT NULL, -- 'place','trip','site'
  target_id         UUID,          -- NULL allowed when target is 'site'
  rating            SMALLINT CHECK (rating BETWEEN 1 AND 5),
  title             TEXT,
  body              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX review_target_idx ON review(target_type, target_id);

-- 9) FAVORITES / WISHLIST / HISTORY ------------------------------------------
CREATE TABLE favorite (
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  target_type       TEXT NOT NULL, -- 'place','trip'
  target_id         UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE trip_history (
  history_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  trip_id           UUID NOT NULL REFERENCES trip(trip_id) ON DELETE CASCADE,
  status            TEXT NOT NULL, -- 'upcoming','completed','cancelled'
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10) NOTIFICATIONS -----------------------------------------------------------
CREATE TABLE notification (
  notification_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  type              TEXT NOT NULL, -- 'trip_invite','comment','booking_update','weather_alert'
  payload           JSONB NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11) WEATHER SNAPSHOTS -------------------------------------------------------
CREATE TABLE weather_snapshot (
  snapshot_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id          UUID NOT NULL REFERENCES place(place_id) ON DELETE CASCADE,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload           JSONB NOT NULL -- raw OpenWeather response for explainability & auditing
);

-- 12) ACHIEVEMENTS & BADGES ---------------------------------------------------
CREATE TABLE badge (
  badge_code        TEXT PRIMARY KEY, -- 'VISITED_5_COUNTRIES','ADVENTURE_SEEKER'
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  icon_url          TEXT
);

CREATE TABLE user_badge (
  user_id           UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
  badge_code        TEXT NOT NULL REFERENCES badge(badge_code) ON DELETE CASCADE,
  awarded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_code)
);

-- 13) EXPLAINABLE RECOMMENDATIONS --------------------------------------------
CREATE TABLE recommendation_log (
  rec_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
  trip_id           UUID REFERENCES trip(trip_id) ON DELETE SET NULL,
  context           JSONB NOT NULL,    -- prompt/preferences
  output            JSONB NOT NULL,    -- proposed items
  explanations      JSONB,             -- why chosen
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14) AUDIT LOGS --------------------------------------------------------------
CREATE TABLE audit_log (
  log_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id     UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
  action            TEXT NOT NULL,     -- 'CREATE_TRIP','UPDATE_ITEM','DELETE_REVIEW'
  target_type       TEXT,
  target_id         UUID,
  details           JSONB,
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15) INDICES & CONSTRAINTS ---------------------------------------------------
CREATE INDEX trip_dates_idx ON trip(start_date, end_date);
CREATE INDEX itinerary_item_place_idx ON itinerary_item(place_id);
CREATE INDEX booking_provider_idx ON booking(provider, provider_ref);

-- 16) SAMPLE ENUM SEEDS -------------------------------------------------------
INSERT INTO cost_category(code,label) VALUES
('lodging','Lodging'),
('food','Food & Dining'),
('transport','Local Transport'),
('activity','Activities'),
('misc','Miscellaneous')
ON CONFLICT DO NOTHING;
