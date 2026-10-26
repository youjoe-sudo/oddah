-- =====================================================================
-- 0001_phase0.sql — مرحلة صفر: الحسابات والمحتوى والتدقيق
-- الحالة: مسودة مراجَعة (انظر docs/07-data-model.md)
-- ملاحظة: جداول مسار التحقق (الصوتيات/الاستوديو/الوكيل/الاشتراكات)
--          تُؤجَّل حتى تقرير POC ولا تُنشأ هنا.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS citext;

-- ---------------------------------------------------------------------
-- 1) الحسابات والأمان
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext NOT NULL UNIQUE,
  email_verified_at timestamptz,
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url  text,
  bio         text,
  locale      text NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar', 'en')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_preferences (
  user_id        uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme          text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  notifications  jsonb NOT NULL DEFAULT '{}'::jsonb,
  privacy        jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user', 'reviewer', 'moderator', 'admin')),
  granted_by  uuid REFERENCES users(id),
  granted_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent   text,
  ip_hash      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz
);
CREATE INDEX sessions_user_active_idx ON sessions (user_id) WHERE revoked_at IS NULL;

-- سجل تدقيق: إضافة فقط (append-only)
CREATE TABLE audit_logs (
  id            bigserial PRIMARY KEY,
  actor_user_id uuid,
  action        text NOT NULL,
  entity_type   text,
  entity_id     text,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_actor_idx ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX audit_logs_created_idx ON audit_logs (created_at DESC);

-- ---------------------------------------------------------------------
-- 2) المحتوى (القرآن والمكتبة) — المصدر والرخصة إلزاميان
-- ---------------------------------------------------------------------
CREATE TABLE content_sources (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  url                 text,
  license             text NOT NULL,
  license_url         text,
  attribution         text,                       -- نص الإسناد المطلوب عرضه
  allows_processing   boolean NOT NULL DEFAULT false,
  allows_commercial   boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'unverified'
                      CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
  verified_at         timestamptz,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_sources_status_idx ON content_sources (verification_status);

CREATE TABLE content_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL
                  CHECK (type IN ('quran_surah', 'hadith', 'tafsir', 'seira', 'lesson', 'article')),
  category        text NOT NULL DEFAULT 'C' CHECK (category IN ('A', 'B', 'C', 'D')),
  slug            text NOT NULL,
  title_ar        text NOT NULL,
  title_en        text,
  body_ar         text,
  body_en         text,
  source_id       uuid REFERENCES content_sources(id),
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'in_review', 'approved',
                                    'published', 'changes_requested', 'escalated', 'rejected')),
  review_required boolean NOT NULL DEFAULT true,
  created_by      uuid REFERENCES users(id),
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type, slug),
  -- المحتوى المنشور يتطلب مصدرًا موثّقًا (المبدأ P-4)
  CONSTRAINT content_published_needs_source
    CHECK (status <> 'published' OR source_id IS NOT NULL)
);
CREATE INDEX content_items_status_type_idx ON content_items (status, type);
CREATE INDEX content_items_search_idx
  ON content_items USING gin (to_tsvector('simple', coalesce(title_ar, '') || ' ' || coalesce(title_en, '')));

CREATE TABLE content_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  edition         text NOT NULL,
  language        text NOT NULL CHECK (language IN ('ar', 'en')),
  body            text NOT NULL,
  source_id       uuid REFERENCES content_sources(id),
  version         integer NOT NULL DEFAULT 1,
  is_current      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_versions_item_idx ON content_versions (content_item_id, is_current);

CREATE TABLE content_reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  reviewer_id     uuid REFERENCES users(id),
  decision        text NOT NULL
                  CHECK (decision IN ('approved', 'changes_requested', 'rejected', 'escalated')),
  notes           text,
  citations       jsonb NOT NULL DEFAULT '[]'::jsonb,   -- المرجع المعتمد (نص/رابط/صفحة)
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_reviews_item_idx ON content_reviews (content_item_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 3) بيانات شخصية اختيارية (القراءة والعبادات)
-- ---------------------------------------------------------------------
CREATE TABLE bookmarks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  anchor          text NOT NULL,                 -- مثل '2:255' أو رقم الصفحة
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_item_id, anchor)
);

CREATE TABLE reading_progress (
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  anchor          text NOT NULL,
  percent         numeric(5,2) NOT NULL DEFAULT 0
                  CHECK (percent >= 0 AND percent <= 100),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_item_id)
);

CREATE TABLE daily_goals (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_date   date NOT NULL,
  target      integer NOT NULL DEFAULT 0 CHECK (target >= 0),
  current     integer NOT NULL DEFAULT 0 CHECK (current >= 0),
  PRIMARY KEY (user_id, goal_date)
);

-- ---------------------------------------------------------------------
-- 4) صلاحيات الدور وسياسات RLS
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_client') THEN
    CREATE ROLE app_client NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO app_client;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_client;

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources     ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals         ENABLE ROW LEVEL SECURITY;

-- users: قراءة الذات/الإدارة. (التسجيل والدخول يمرّان بمسار مخصّص
--        يعمل بصلاحية المالك خارج هذه السياسات — انظر src/lib/auth)
CREATE POLICY users_select ON users FOR SELECT TO app_client
  USING (
    id::text = current_setting('app.user_id', true)
    OR current_setting('app.user_role', true) IN ('admin', 'moderator')
  );
CREATE POLICY users_update ON users FOR UPDATE TO app_client
  USING (id::text = current_setting('app.user_id', true))
  WITH CHECK (id::text = current_setting('app.user_id', true));

-- profiles
CREATE POLICY profiles_select ON profiles FOR SELECT TO app_client
  USING (
    user_id::text = current_setting('app.user_id', true)
    OR current_setting('app.user_role', true) IN ('admin', 'moderator')
  );
CREATE POLICY profiles_write ON profiles FOR ALL TO app_client
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- user_preferences
CREATE POLICY preferences_own ON user_preferences FOR ALL TO app_client
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- user_roles
CREATE POLICY roles_read_own ON user_roles FOR SELECT TO app_client
  USING (
    user_id::text = current_setting('app.user_id', true)
    OR current_setting('app.user_role', true) = 'admin'
  );
CREATE POLICY roles_admin_write ON user_roles FOR ALL TO app_client
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

-- sessions
CREATE POLICY sessions_own ON sessions FOR ALL TO app_client
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- audit_logs: قراءة للإدارة، وإضافة فقط، ولا حذف ولا تعديل
CREATE POLICY audit_read_admin ON audit_logs FOR SELECT TO app_client
  USING (current_setting('app.user_role', true) IN ('admin', 'moderator'));
CREATE POLICY audit_insert ON audit_logs FOR INSERT TO app_client WITH CHECK (true);
REVOKE UPDATE, DELETE ON audit_logs FROM app_client;

-- content_sources: قراءة عامة (المصدر والرخصة معلنان)، وتحديث للإدارة
CREATE POLICY sources_read ON content_sources FOR SELECT TO app_client USING (true);
CREATE POLICY sources_write ON content_sources FOR ALL TO app_client
  USING (current_setting('app.user_role', true) IN ('admin', 'moderator'))
  WITH CHECK (current_setting('app.user_role', true) IN ('admin', 'moderator'));

-- content_items: المنشور للجميع، وما عداه لأصحابه ومديري المراجعة
CREATE POLICY content_read ON content_items FOR SELECT TO app_client
  USING (
    status = 'published'
    OR created_by::text = current_setting('app.user_id', true)
    OR current_setting('app.user_role', true) IN ('reviewer', 'moderator', 'admin')
  );
CREATE POLICY content_write ON content_items FOR ALL TO app_client
  USING (
    created_by::text = current_setting('app.user_id', true)
    OR current_setting('app.user_role', true) IN ('reviewer', 'moderator', 'admin')
  )
  WITH CHECK (
    created_by::text = current_setting('app.user_id', true)
    OR current_setting('app.user_role', true) IN ('reviewer', 'moderator', 'admin')
  );

-- content_versions
CREATE POLICY versions_read ON content_versions FOR SELECT TO app_client
  USING (
    EXISTS (
      SELECT 1 FROM content_items i
      WHERE i.id = content_item_id
        AND (
          i.status = 'published'
          OR i.created_by::text = current_setting('app.user_id', true)
          OR current_setting('app.user_role', true) IN ('reviewer', 'moderator', 'admin')
        )
    )
  );

-- content_reviews
CREATE POLICY reviews_read ON content_reviews FOR SELECT TO app_client
  USING (
    current_setting('app.user_role', true) IN ('reviewer', 'moderator', 'admin')
    OR reviewer_id::text = current_setting('app.user_id', true)
  );
CREATE POLICY reviews_write ON content_reviews FOR INSERT TO app_client
  WITH CHECK (current_setting('app.user_role', true) IN ('reviewer', 'moderator', 'admin'));

-- بيانات القراءة الشخصية: ملكية صارمة
CREATE POLICY bookmarks_own ON bookmarks FOR ALL TO app_client
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

CREATE POLICY progress_own ON reading_progress FOR ALL TO app_client
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

CREATE POLICY goals_own ON daily_goals FOR ALL TO app_client
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
