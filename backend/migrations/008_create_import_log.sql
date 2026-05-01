CREATE TABLE IF NOT EXISTS import_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_file       VARCHAR(255) NOT NULL,
    total_baris     INT NOT NULL,
    berhasil        INT NOT NULL,
    duplikat        INT NOT NULL,
    gagal           INT NOT NULL,
    error_detail    JSONB,
    diimport_oleh   UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
