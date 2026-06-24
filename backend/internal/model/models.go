package model

import (
	"encoding/json"
	"time"
)

type User struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	FullName     string `json:"full_name"`
	Role         string `json:"role"`
	PasswordHash string `json:"-"`
	IsActive     bool   `json:"is_active"`
}

type Warga struct {
	ID                 string    `json:"id"`
	NIK                string    `json:"nik"`
	NoKK               string    `json:"no_kk"`
	NamaLengkap        string    `json:"nama_lengkap"`
	TanggalLahir       time.Time `json:"tanggal_lahir"`
	JenisKelamin       string    `json:"jenis_kelamin"`
	Alamat             string    `json:"alamat"`
	RT                 *string   `json:"rt,omitempty"`
	RW                 *string   `json:"rw,omitempty"`
	NoHP               *string   `json:"no_hp,omitempty"`
	FotoKtpURL         *string   `json:"foto_ktp_url,omitempty"`
	FotoKKURL          *string   `json:"foto_kk_url,omitempty"`
	C1Value            float64   `json:"c1_value"`
	C2Value            float64   `json:"c2_value"`
	C3Value            float64   `json:"c3_value"`
	C4Value            float64   `json:"c4_value"`
	C5Value            float64   `json:"c5_value"`
	C6Value            float64   `json:"c6_value"`
	C7Value            float64   `json:"c7_value"`
	C8Value            float64   `json:"c8_value"`
	C9Value            float64   `json:"c9_value"`
	C10Value           float64   `json:"c10_value"`
	C11Value           float64   `json:"c11_value"`
	C12Value           float64   `json:"c12_value"`
	C13Value           float64   `json:"c13_value"`
	IsActive           bool      `json:"is_active"`
	CreatedBy          *string   `json:"created_by,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type AuditLog struct {
	ID        int64           `json:"id"`
	UserID    string          `json:"user_id"`
	ActorName string          `json:"actor_name"`
	Aksi      string          `json:"aksi"`
	Tabel     string          `json:"tabel"`
	RecordID  string          `json:"record_id"`
	DataLama  json.RawMessage `json:"data_lama,omitempty"`
	DataBaru  json.RawMessage `json:"data_baru,omitempty"`
	IPAddress string          `json:"ip_address,omitempty"`
	UserAgent string          `json:"user_agent,omitempty"`
	CreatedAt time.Time       `json:"created_at"`
}

type KriteriaBobot struct {
	ID         string    `json:"id"`
	Versi      string    `json:"versi"`
	Keterangan *string   `json:"keterangan,omitempty"`
	BobotC1    float64   `json:"bobot_c1"`
	BobotC2    float64   `json:"bobot_c2"`
	BobotC3    float64   `json:"bobot_c3"`
	BobotC4    float64   `json:"bobot_c4"`
	BobotC5    float64   `json:"bobot_c5"`
	BobotC6    float64   `json:"bobot_c6"`
	BobotC7    float64   `json:"bobot_c7"`
	BobotC8    float64   `json:"bobot_c8"`
	BobotC9    float64   `json:"bobot_c9"`
	BobotC10   float64   `json:"bobot_c10"`
	BobotC11   float64   `json:"bobot_c11"`
	BobotC12   float64   `json:"bobot_c12"`
	BobotC13   float64   `json:"bobot_c13"`
	IsActive   bool      `json:"is_active"`
	DibuatOleh *string   `json:"dibuat_oleh,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type PeriodeBansos struct {
	ID             string    `json:"id"`
	NamaPeriode    string    `json:"nama_periode"`
	TanggalMulai   time.Time `json:"tanggal_mulai"`
	TanggalSelesai time.Time `json:"tanggal_selesai"`
	Kuota          int       `json:"kuota"`
	BobotID        *string   `json:"bobot_id,omitempty"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
}

type HasilSAWReport struct {
	ID          string  `json:"id"`
	PeriodeID   string  `json:"periode_id"`
	WargaID     string  `json:"warga_id"`
	NamaLengkap string  `json:"nama_lengkap"`
	NIK         string  `json:"nik"`
	RT          *string `json:"rt,omitempty"`
	RW          *string `json:"rw,omitempty"`
	NilaiVI     float64 `json:"nilai_vi"`
	Ranking     int     `json:"ranking"`
	Status      string  `json:"status"`
}

type HasilSAWSummary struct {
	Total      int     `json:"total"`
	Penerima   int     `json:"penerima"`
	Cadangan   int     `json:"cadangan"`
	TidakLolos int     `json:"tidak_lolos"`
	RataRata   float64 `json:"rata_rata"`
}

type Schedule struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	StartTime string    `json:"start_time"`
	EndTime   string    `json:"end_time"`
	Date      time.Time `json:"date"`
	CreatedAt time.Time `json:"created_at"`
}

