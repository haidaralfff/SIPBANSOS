CREATE TABLE IF NOT EXISTS settings (
    key   VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES
('nama_desa', 'Desa Mekar Jaya'),
('kecamatan', 'Cibinong'),
('kabupaten', 'Bogor'),
('provinsi', 'Jawa Barat'),
('logo_desa', ''),
('nomor_sk_format', '[NOMOR]/[KODE-DESA]/[BULAN-ROMAWI]/[TAHUN]'),
('ttd_digital', '')
ON CONFLICT (key) DO NOTHING;
