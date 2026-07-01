-- Seeding additional users: kades, petugas, and operator_rw
INSERT INTO users (username, email, password, full_name, role, is_active)
VALUES 
    (
        'kades',
        'kades@sipbansos.local',
        '$2a$12$0f5pnjAG6c6r/sGgJjT2xedmQnFmQKg9e/NGZkcn9Y.995tcYuaNC',
        'Kepala Desa',
        'kepala_desa',
        TRUE
    ),
    (
        'petugas',
        'petugas@sipbansos.local',
        '$2a$12$/aRpsudywPNv1/b0Zr081.IZv1nEZUwLfN3kd.3b7/7jq5RvqR2qC',
        'Petugas Survei',
        'petugas',
        TRUE
    ),
    (
        'operator',
        'operator@sipbansos.local',
        '$2a$12$5lbiHBLtRrxQSIrl6KgLFetZulqmn6l34lD6xgB2ZyLLjHrdcNQWa',
        'Operator RW/RT',
        'operator_rw',
        TRUE
    )
ON CONFLICT (username) DO NOTHING;
