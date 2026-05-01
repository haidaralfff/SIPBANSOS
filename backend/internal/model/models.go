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
