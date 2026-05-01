CREATE TABLE IF NOT EXISTS periode_bansos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_periode    VARCHAR(100) NOT NULL,
    tanggal_mulai   DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    kuota           INT NOT NULL,
    bobot_id        UUID REFERENCES bobot_kriteria(id),
    status          VARCHAR(20) DEFAULT 'draft',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
