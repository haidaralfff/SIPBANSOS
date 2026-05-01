INSERT INTO users (username, email, password, full_name, role, is_active)
VALUES (
    'admin',
    'admin@sipbansos.local',
    '$2a$12$L9Qica9skjpyXB1y.v6Xcet6B6Q6wryRRJezAqg3cPY3oiOElJ9CG',
    'Admin Desa',
    'admin',
    TRUE
)
ON CONFLICT (username) DO NOTHING;
