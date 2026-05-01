CREATE INDEX IF NOT EXISTS idx_warga_nik ON warga(nik);
CREATE INDEX IF NOT EXISTS idx_warga_nama ON warga(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_warga_rt_rw ON warga(rt, rw);
CREATE INDEX IF NOT EXISTS idx_warga_deleted ON warga(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hasil_periode ON hasil_saw(periode_id);
CREATE INDEX IF NOT EXISTS idx_hasil_ranking ON hasil_saw(periode_id, ranking);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(tabel, record_id, created_at DESC);
