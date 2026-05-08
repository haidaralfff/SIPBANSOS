package model

import "time"

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
	Penghasilan        int64     `json:"penghasilan"`
	JumlahTanggungan   int       `json:"jumlah_tanggungan"`
	KondisiTempat      int       `json:"kondisi_tempat"`
	StatusKepemilikan  int       `json:"status_kepemilikan"`
	AksesAir           int       `json:"akses_air"`
	PengeluaranListrik int64     `json:"pengeluaran_listrik"`
	PengeluaranPangan  int64     `json:"pengeluaran_pangan"`
	BiayaPendidikan    int64     `json:"biaya_pendidikan"`
	BiayaKesehatan     int64     `json:"biaya_kesehatan"`
	CicilanHutang      int64     `json:"cicilan_hutang"`
	TingkatPendidikan  int       `json:"tingkat_pendidikan"`
	StatusPekerjaan    int       `json:"status_pekerjaan"`
	KondisiKesehatan   int       `json:"kondisi_kesehatan"`
	IsActive           bool      `json:"is_active"`
	CreatedBy          *string   `json:"created_by,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
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
	Total      int `json:"total"`
	Penerima   int `json:"penerima"`
	Cadangan   int `json:"cadangan"`
	TidakLolos int `json:"tidak_lolos"`
}
