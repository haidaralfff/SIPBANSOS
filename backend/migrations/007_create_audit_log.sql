CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    aksi        VARCHAR(50) NOT NULL,
    tabel       VARCHAR(50),
    record_id   UUID,
    data_lama   JSONB,
    data_baru   JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
