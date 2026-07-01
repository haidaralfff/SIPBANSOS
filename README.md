# SIPBANSOS - Sistem Informasi Penentu Bantuan Sosial

## 📋 Deskripsi Proyek

**SIPBANSOS** adalah aplikasi web berbasis micro-ERP yang dirancang untuk unit pemerintah tingkat desa/kelurahan. Sistem ini mengotomatisasi proses seleksi, pemeringkatan, dan distribusi penerima **Bantuan Langsung Tunai (BLT)** secara transparan, terukur, dan objektif menggunakan algoritma **Simple Additive Weighting (SAW)** berdasarkan 13 indikator kesejahteraan.

### 🎯 Masalah yang Diselesaikan

| Masalah | Solusi SIPBANSOS |
|---------|------------------|
| Seleksi bersifat subjektif | Pemeringkatan objektif via algoritma SAW |
| Data tersebar di dokumen fisik/Excel | Terpusat dalam satu database |
| Tidak ada jejak audit | Log audit otomatis setiap transaksi |
| Laporan manual memakan waktu | Ekspor PDF/Excel otomatis |
| Rentan manipulasi data | RBAC + JWT + Bcrypt + audit trail |
| Tidak ada mekanisme import massal | Import CSV/Excel dengan validasi |

---

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Go (Golang)
- **Database**: PostgreSQL
- **Authentication**: JWT + RBAC

---

## 📁 Struktur Proyek

```
SIPBANSOS/
├── backend/          # REST API (Go)
│   ├── cmd/         # Entry points
│   ├── internal/    # Business logic
│   ├── migrations/  # Database migrations
│   ├── pkg/         # Shared packages
│   └── Dockerfile
├── frontend/        # Web UI (React + Vite)
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat

- **Backend**: Go 1.20+ dan PostgreSQL 12+
- **Frontend**: Node.js 16+ dan npm/yarn

### 1. Setup Backend (Go)

#### a. Konfigurasi Database

Buat database PostgreSQL dan sesuaikan connection string:

```bash
cd backend

# Salin file contoh environment
cp .env.example .env

# Edit nilai DATABASE_URL di file .env
# Format: postgres://user:password@localhost:5432/sipbansos?sslmode=disable
```

#### b. Jalankan Migration

```bash
cd backend
go run cmd/migrate/main.go
```

Migration akan membuat tabel-tabel berikut:
- `users` - Data pengguna
- `warga` - Data keluarga penerima potensial
- `bobot_kriteria` - Bobot kriteria SAW
- `periode_bansos` - Periode bantuan
- `hasil_saw` - Hasil perhitungan SAW
- `audit_log` - Log audit sistem
- `import_log` - Log import data

#### c. Jalankan Server Backend

```bash
cd backend
go run cmd/server/main.go
```

Server akan berjalan di `http://localhost:8080` (default)

**Environment Variables yang tersedia:**
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Port server (default: 8080)
- `JWT_SECRET` - Secret key untuk JWT
- `JWT_ACCESS_TTL` - Token access TTL (default: 8h)
- `JWT_REFRESH_TTL` - Token refresh TTL (default: 24h)

### 2. Setup Frontend (React)

#### a. Install Dependencies

```bash
cd frontend
npm install
# atau
yarn install
```

#### b. Jalankan Development Server

```bash
cd frontend
npm run dev
# atau
yarn dev
```

Server development akan berjalan di `http://localhost:5173`

#### c. Build untuk Production

```bash
cd frontend
npm run build
# atau
yarn build
```

Output build akan berada di folder `dist/`

---

## 👤 User Akun


| Email | Username | Password | Role | Deskripsi |
|---------|----------|------|-----------|-----------|
| admin@sipbansos.local | admin | Admin123! | Admin | Admin |
| kades@sipbansos.local | kades | Kades123! | Kepala Desa | Kepala Desa |
| petugas@sipbansos.local | petugas | Petugas123! | Petugas Survei | Petugas Survei |
| operator@sipbansos.local | operator | Operator123! | Operator RW/RT | Operator RW/RT |

---

## 📖 Fitur Utama

### ✅ Autentikasi & Otorisasi
- Login dengan username/password
- JWT token-based authentication
- RBAC (Role-Based Access Control)
- 4 role: Admin, Kepala Desa, Petugas Survei, Operator RW/RT

### ✅ Manajemen Data Warga
- Input data keluarga dengan 13 indikator kesejahteraan
- Edit dan hapus data warga
- Verifikasi data oleh operator RW/RT
- Import massal via CSV/Excel

### ✅ Konfigurasi Kriteria
- Atur bobot setiap kriteria (13 indikator)
- Tentukan sifat kriteria (Benefit/Cost)
- Preview perhitungan SAW

### ✅ Perhitungan SAW
- Algoritma SAW otomatis mengolah data
- Normalisasi matriks keputusan
- Perhitungan nilai preferensi
- Ranking hasil secara otomatis

### ✅ Laporan & Ekspor
- Dashboard dengan grafik overview
- Laporan ranking penerima bansos
- Ekspor ke PDF atau Excel
- Filter berdasarkan periode bansos

### ✅ Audit Log
- Pencatatan setiap perubahan data
- Jejak siapa, kapan, dan apa yang diubah
- Tidak dapat dihapus (immutable)

---

## 🔌 API Endpoints (Ringkasan)

### Authentication
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/logout` - Logout pengguna

### Warga (Data Penerima Potensial)
- `GET /api/warga` - Daftar warga
- `POST /api/warga` - Tambah warga
- `PUT /api/warga/:id` - Edit warga
- `DELETE /api/warga/:id` - Hapus warga

### Kriteria
- `GET /api/kriteria` - Daftar kriteria
- `PUT /api/kriteria/:id` - Update bobot kriteria

### SAW (Perhitungan)
- `POST /api/saw/calculate` - Jalankan perhitungan SAW
- `GET /api/saw/results` - Lihat hasil SAW

### Laporan
- `GET /api/reports/ranking` - Laporan ranking
- `GET /api/reports/export/pdf` - Export PDF
- `GET /api/reports/export/excel` - Export Excel

---

## 📊 Penjelasan Algoritma SAW

### Simple Additive Weighting (SAW)

SAW adalah metode pengambilan keputusan multi-kriteria yang menentukan nilai preferensi alternatif berdasarkan nilai bobot yang telah ditentukan sebelumnya.

**Langkah-langkah perhitungan:**

1. **Normalisasi Matriks Keputusan**
   - Untuk kriteria benefit: $r_{ij} = \frac{x_{ij}}{\max(x_i)}$
   - Untuk kriteria cost: $r_{ij} = \frac{\min(x_i)}{x_{ij}}$

2. **Perhitungan Nilai Preferensi**
   $$V(A_i) = \sum_{j=1}^{n} w_j \cdot r_{ij}$$
   
   Dimana:
   - $V(A_i)$ = Nilai preferensi alternatif ke-i
   - $w_j$ = Bobot kriteria ke-j
   - $r_{ij}$ = Nilai normalisasi alternatif ke-i pada kriteria ke-j

3. **Ranking**: Alternatif diurutkan dari nilai preferensi tertinggi ke terendah

---

## 🔐 Keamanan

- **Password Hashing**: Bcrypt dengan salt
- **JWT Token**: Token berbasis waktu dengan secret key
- **RBAC**: Kontrol akses berbasis peran
- **Audit Trail**: Semua perubahan tercatat dan tidak dapat dihapus
- **Input Validation**: Validasi data di backend dan frontend
- **CORS**: Konfigurasi CORS untuk API security

---

## 📝 Catatan Pengembangan

13 kriteria kesejahteraan yang digunakan:
- **C1**: Jumlah Anggota Keluarga (Benefit)
- **C2**: Jumlah Tanggungan (Benefit)
- **C3**: Pendidikan Kepala Keluarga (Cost)
- **C4**: Pekerjaan Kepala Keluarga (Cost)
- **C5**: Status Rumah (Benefit)
- **C6**: Luas Rumah (Cost)
- **C7**: Daya Listrik (Cost)
- **C8**: Jumlah Kendaraan (Cost)
- **C9**: Tabungan (Cost)
- **C10**: Penghasilan per Bulan (Cost)
- **C11**: Pengeluaran per Bulan (Benefit)
- **C12**: Kondisi Dinding (Cost)
- **C13**: Akses Air (Cost)

---

## 🤝 Kontribusi

Untuk berkontribusi pada proyek ini:

1. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
2. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
3. Push ke branch (`git push origin feature/AmazingFeature`)
4. Buat Pull Request

---

## 📄 Lisensi

Proyek ini adalah tugas kuliah untuk mata kuliah **Sistem Pendukung Keputusan** semester 4.

---

## 📧 Kontak & Dukungan

Untuk pertanyaan atau masalah, silakan buat issue di repository ini.

---

## 👥 Tim Pengembang

* **Frontend Developer** — Haidar Habibi Al Farisi
* **Backend Developer** — Wahyu Tri Cahya

