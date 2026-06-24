CREATE TABLE IF NOT EXISTS schedules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(150) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
