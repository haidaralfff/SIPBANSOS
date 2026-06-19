INSERT INTO bobot_kriteria (
    versi,
    keterangan,
    bobot_c1,
    bobot_c2,
    bobot_c3,
    bobot_c4,
    bobot_c5,
    bobot_c6,
    bobot_c7,
    bobot_c8,
    bobot_c9,
    bobot_c10,
    bobot_c11,
    bobot_c12,
    bobot_c13,
    is_active
)
SELECT 
    'v1.0',
    'Bobot Default SIPBANSOS (13 Kriteria)',
    0.06, -- C1
    0.10, -- C2
    0.05, -- C3
    0.10, -- C4
    0.08, -- C5
    0.06, -- C6
    0.05, -- C7
    0.05, -- C8
    0.06, -- C9
    0.15, -- C10
    0.10, -- C11
    0.08, -- C12
    0.06, -- C13
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM bobot_kriteria WHERE versi = 'v1.0'
);

