
BAB III
PENYUSUNAN METODOLOGI DAN IMPLEMENTASI

---

## 1. Tahapan Penelitian

### 1.1 Identifikasi Masalah dan Peluang

Proses penelitian dimulai dengan identifikasi permasalahan di lapangan:

**Masalah Utama yang Dihadapi:**
- Proses seleksi penerima bantuan sosial bersifat **subjektif**, rentan nepotisme dan manipulasi data
- Data warga tersebar di dokumen fisik dan file Excel yang tidak terstruktur
- Tidak ada **jejak audit** resmi untuk perubahan data dan keputusan
- Laporan manual memakan waktu **berhari-hari** sehingga tidak responsif terhadap dinamika sosial
- Tidak ada mekanisme **import massal** data dari sistem lama atau survei lapangan
- Keputusan tidak dapat dipertanggungjawabkan secara hukum kepada BPK/Inspektorat

**Peluang Solusi:**
- Menerapkan algoritma **Simple Additive Weighting (SAW)** untuk pemeringkatan objektif
- Membangun **Sistem Informasi Penentu Bantuan Sosial (SIPBANSOS)** berbasis web dengan database terpusat
- Implementasi **RBAC (Role-Based Access Control)** + Audit Log untuk transparansi dan keamanan
- Otomatisasi ekspor laporan dan surat keputusan dalam hitungan detik

---

### 1.2 Tahapan Penelitian

Penelitian dilakukan dalam 5 tahapan utama:

#### **Tahapan 1: Studi Literatur & Analisis Kebutuhan**
- Analisis regulasi bantuan sosial tingkat desa/kelurahan
- Kajian algoritma SAW dan perbandingan dengan metode lain (TOPSIS, PROMETHEE, AHP)
- Wawancara dengan stakeholder: Admin Desa, Kepala Desa, Petugas Survei, Operator RW/RT
- Identifikasi 13 kriteria kesejahteraan yang relevan
- Hasil: **Project Brief (PRD) v2.0** dan spesifikasi fungsional sistem

#### **Tahapan 2: Desain Sistem & Database**
- Perancangan Arsitektur High-Level (Frontend React + Backend Golang + PostgreSQL)
- Entity Relationship Diagram (ERD) dan desain skema database
- Spesifikasi REST API endpoints (auth, CRUD data, import/export, SAW engine)
- Desain User Interface dengan tema pastel hangat (3-kolom layout)
- Hasil: **Database schema**, **API specification**, **UI mockup**

#### **Tahapan 3: Implementasi Backend & Database**
- Setup PostgreSQL dengan migration scripts dan indexing untuk performa
- Implementasi service layer SAW engine (normalisasi, perhitungan preferensi, ranking)
- Implementasi authentication (JWT + Bcrypt), RBAC middleware, audit logging
- Implementasi handlers untuk CRUD data warga, import/export data
- Unit test SAW engine untuk memastikan akurasi perhitungan (coverage ≥ 70%)
- Hasil: **Backend API production-ready**, **database terisi dengan seed data**

#### **Tahapan 4: Implementasi Frontend & Integrasi**
- Setup React + Vite + Tailwind CSS dengan komponen reusable
- Implementasi semua halaman per spesifikasi (Dashboard, Data Warga, Import/Export, Kriteria, SAW, Laporan, Pengguna, Pengaturan)
- Integrasi dengan backend API, error handling, loading states
- Implementasi JWT token management dan ProtectedRoute
- Hasil: **Frontend production-ready**, **full system integration tested**

#### **Tahapan 5: Pengujian, Dokumentasi & Penyerahan**
- User Acceptance Testing (UAT) dengan stakeholder lokal
- Performance testing (SAW engine 1000+ data < 2 detik, API response < 500ms)
- Security testing (SQL injection, XSS, CSRF, rate limiting)
- Dokumentasi teknis (README, API docs, deployment guide)
- Pelatihan pengguna (Admin, Petugas, Kepala Desa)
- Hasil: **System ready untuk production deployment**

---

### 1.3 Flowchart Tahapan Penelitian & Implementasi

```
START
  │
  ├─→ [TAHAP 1: Studi Literatur]
  │   └─→ Analisis regulasi, algoritma SAW, wawancara stakeholder
  │       └─→ Output: PRD, Spesifikasi Fungsional
  │
  ├─→ [TAHAP 2: Desain Sistem]
  │   ├─→ Arsitektur sistem (3-layer)
  │   ├─→ ERD & Database schema
  │   ├─→ REST API specification
  │   └─→ UI/UX mockup (3-kolom layout)
  │       └─→ Output: Design documents
  │
  ├─→ [TAHAP 3: Implementasi Backend]
  │   ├─→ Setup PostgreSQL + migrations
  │   ├─→ Implementasi auth, RBAC, audit logging
  │   ├─→ Implementasi SAW engine service
  │   ├─→ Implementasi handler CRUD, import/export
  │   ├─→ Unit testing (coverage ≥ 70%)
  │   └─→ Output: Backend API ready
  │
  ├─→ [TAHAP 4: Implementasi Frontend]
  │   ├─→ Setup React + Vite + Tailwind
  │   ├─→ Implementasi 8 halaman utama
  │   ├─→ Integrasi API + error handling
  │   ├─→ Testing responsivitas & aksesibilitas
  │   └─→ Output: Frontend ready
  │
  ├─→ [TAHAP 5: Testing, Dokumentasi, UAT]
  │   ├─→ Performance testing (SAW < 2 detik, API < 500ms)
  │   ├─→ Security testing (injeksi, XSS, CSRF)
  │   ├─→ User Acceptance Testing dengan stakeholder
  │   ├─→ Dokumentasi teknis & deployment guide
  │   ├─→ Pelatihan pengguna (2 jam)
  │   └─→ Output: System production-ready
  │
  └─→ END (Penyerahan sistem ke desa)
```

---

### 1.4 Alur Bisnis Utama Sistem

```
PETUGAS SURVEI / ADMIN
  │
  ├─→ [Input / Import Data Warga]
  │   └─→ Validasi di backend (NIK duplikat, format, dll)
  │       └─→ Simpan ke tabel warga (PostgreSQL)
  │
ADMIN DESA
  │
  ├─→ [Konfigurasi Kriteria & Bobot]
  │   └─→ Edit persentase bobot 13 kriteria (total = 100%)
  │       └─→ Simpan sebagai versi baru untuk audit trail
  │
  ├─→ [Eksekusi SAW Engine]
  │   ├─→ Pilih periode bansos & kuota penerima
  │   ├─→ Backend jalankan SAW:
  │   │   ├─→ Step 1: Ambil matriks keputusan (alternatif × kriteria)
  │   │   ├─→ Step 2: Normalisasi (benefit/cost)
  │   │   ├─→ Step 3: Hitung preferensi (Vi = Σ bobot × nilai norm)
  │   │   ├─→ Step 4: Sort descending → ranking final
  │   │   └─→ Step 5: Tandai status (Penerima/Cadangan/Tidak Lolos)
  │   └─→ Simpan hasil ke tabel hasil_saw
  │
KEPALA DESA
  │
  ├─→ [Review Hasil Ranking]
  │   ├─→ Lihat tabel ranking dengan skor per alternatif
  │   ├─→ Bisa override status dengan alasan (tercatat di audit log)
  │   └─→ Aprove hasil akhir
  │
  ├─→ [Ekspor Laporan & SK]
  │   ├─→ Ekspor PDF: Surat Keputusan (SK) penerima BLT
  │   ├─→ Ekspor PDF: Laporan ranking resmi (kop desa, tanda tangan)
  │   ├─→ Ekspor Excel: Data rekapitulasi per RT/RW
  │   └─→ Cetak & sebarkan ke masyarakat untuk transparansi
  │
ADMIN/INSPECTOR (Audit)
  │
  └─→ [Review Audit Log & History]
      └─→ Lihat semua perubahan data + siapa melakukan + kapan
          └─→ Laporan untuk keperluan pemeriksaan BPK/Inspektorat
```

---

## 2. Sumber dan Pengumpulan Data

### 2.1 Sumber Data

#### **A. Data Primer (Survei Lapangan)**
- **Sumber:** Responden langsung dari rumah tangga miskin di desa/kelurahan
- **Metode:** 
  - Survei tatap muka oleh Petugas Survei dengan kuisioner terstruktur
  - Perekaman dokumen (foto KTP, foto KK, foto kondisi rumah)
  - Verifikasi RT/RW atas data yang dikumpulkan
- **Variabel:** 13 kriteria kesejahteraan (jumlah tanggungan, pendidikan, pekerjaan, kondisi rumah, akses air, listrik, penghasilan, dll)
- **Cakupan:** Seluruh rumah tangga di desa/kelurahan target (misal: 500–2000 KK)
- **Timeline:** Pengumpulan data dilakukan selama 2–4 minggu

#### **B. Data Sekunder (Existing Database)**
- **Sumber 1:** Database Daftar Penerima Bansos Tahun Lalu (periode sebelumnya)
  - Digunakan sebagai referensi untuk deteksi "langganan penerima" yang mungkin sudah layak keluar
  - Diimpor ke sistem sebagai data historis
  
- **Sumber 2:** Kaggle Dataset - Bantuan Sosial Klasifikasi
  - URL: https://www.kaggle.com/datasets/bgapicode/bantuan-sosial-klasifikasi?select=Bantuan+Sosial.csv
  - Digunakan untuk benchmark & validasi skala kriteria
  - Tidak langsung masuk ke sistem, hanya referensi metodologi
  
- **Sumber 3:** Data Monografi Desa (dari Pemerintah Desa)
  - Jumlah penduduk per RT/RW
  - Jumlah KK per wilayah
  - Lokasi geografis dan karakteristik desa

#### **C. Data Terstruktur Input Sistem**
- **Sumber:** Form/template input di aplikasi SIPBANSOS
  - **Manual input:** Admin/Petugas menginput 1 KK per form
  - **Bulk import:** Upload file Excel/CSV dengan template yang sudah disediakan
  - **Validasi:** Backend melakukan validasi format, duplikat NIK, range nilai, dll

---

### 2.2 Teknik Pengumpulan Data

#### **Metode 1: Kuisioner Survei Lapangan (Wawancara)**
```
Instrumen      : Kuisioner terstruktur (offline di kertas atau online via form)
Target         : Rumah tangga sasaran (calon penerima bansos)
Pewawancara    : Petugas Survei yang sudah dilatih
Durasi per KK  : 15-30 menit
Pertanyaan     : 13 kriteria kesejahteraan + identitas
Output         : Data raw per KK, tersimpan di field notes atau digital form
```

#### **Metode 2: Dokumentasi & Verifikasi**
```
Dokumen        : Fotokopi KTP, KK, bukti penghasilan (slip gaji/usaha)
Verifikasi     : Operator RW/RT mengecek laporan sebelum dikirim ke admin
Output         : Confidence score per data (valid/perlu review/reject)
```

#### **Metode 3: Bulk Import Data**
```
Template       : File Excel/CSV dengan 13 kolom kriteria + identitas
Proses         : 
  1. User download template dari sistem
  2. Isi data di Excel / CSV (manual atau dari survei digital)
  3. Upload file ke sistem
  4. Backend validasi setiap baris:
     - Format kolom (tipe data, range, duplikat NIK)
     - Generate laporan error (baris ke berapa, error apa, perbaikan)
  5. User review & klik "Konfirmasi Import" untuk N baris yang valid
  6. Data masuk ke database
Output         : Import log mencatat siapa, kapan, berapa data, error berapa
```

#### **Metode 4: Verifikasi Data via Sistem**
```
Partisipan     : Operator RW/RT (melalui aplikasi web)
Proses         : RW/RT review data anggota wilayahnya, bisa edit/reject
Output         : Status verifikasi per KK (verified/pending/rejected)
```

---

### 2.3 Skala Pengumpulan Data & Sampling

| Aspek | Detail |
|-------|--------|
| **Populasi Target** | Rumah tangga calon penerima BLT di satu desa/kelurahan |
| **Jumlah Sample** | N = 500–2000 KK (sesuai kebutuhan desa, asumsi desa kecil) |
| **Metode Sampling** | **Purposive Sampling** — hanya rumah tangga dengan indikasi ekonomi rendah |
| **Tingkat Kepercayaan** | 95% (α = 0.05), jika menggunakan formula statistik |
| **Margin Error** | ±5% (untuk jumlah sample ~384 KK dari populasi 2000) |
| **Instrumen Validitas** | Kuisioner disusun berdasarkan kriteria SPK yang sudah divalidasi oleh BPS & KEMENKEU |

---

### 2.4 Proses Validasi Data Input

Setiap data warga yang masuk melalui tahapan validasi berlapis:

```
INPUT DATA (via form manual atau bulk import)
  │
  ├─→ [Validasi Format Teknis]
  │   ├─→ Tipe data sesuai (NIK = 16 digit, angka = number, dll)
  │   ├─→ Rentang nilai (penghasilan ≥ 0, daya listrik ada di daftar, dll)
  │   ├─→ Duplikat NIK dalam batch upload
  │   └─→ Kolom wajib isi (tidak boleh kosong)
  │
  ├─→ [Validasi Logika Bisnis]
  │   ├─→ Usia KK minimal 18 tahun
  │   ├─→ Jumlah tanggungan ≤ jumlah anggota keluarga
  │   ├─→ Pengeluaran per bulan ≤ penghasilan (sanity check)
  │   └─→ Kriteria kualitif ada di daftar pilihan (misal: pendidikan = SMA, bukan "Semua")
  │
  ├─→ [Validasi Duplikat & Historis]
  │   ├─→ Cek NIK sudah ada di database warga (duplikat?)
  │   ├─→ Cek riwayat: sudah pernah penerima berapa kali?
  │   └─→ Flag: warga ini potensial "langganan" → review manual
  │
  ├─→ [Output Laporan Validasi]
  │   ├─→ ✅ N data valid (siap import)
  │   ├─→ ⚠️  M data warning (tapi bisa diimpor)
  │   ├─→ ❌ K data error (tidak bisa import, perlu perbaikan)
  │   └─→ Preview laporan error (baris ke-X: error type, saran perbaikan)
  │
  └─→ USER DECISION: Konfirmasi import untuk data valid + warning
      └─→ Data masuk ke tabel warga, tercatat di import_log
```

---

## 3. Langkah-Langkah Metode SPK (Simple Additive Weighting / SAW)

### 3.A Penentuan Kriteria

#### Definisi 13 Kriteria Kesejahteraan

Berdasarkan analisis kebutuhan dan referensi regulasi BPS, dipilih 13 kriteria yang mencerminkan kondisi sosial-ekonomi rumah tangga:

| No | Kode | Kriteria | Tipe Atribut | Bobot Default | Skala / Input |
|:--:|:----:|----------|:------------:|:-------------:|:-------------:|
| 1 | C1 | Jumlah Anggota Keluarga | Benefit | 6% | Angka (Number) |
| 2 | C2 | Jumlah Tanggungan | Benefit | 10% | Angka (Number) |
| 3 | C3 | Pendidikan Kepala Keluarga | Benefit | 5% | Pilihan 1-5 (Skor) |
| 4 | C4 | Pekerjaan Kepala Keluarga | Benefit | 10% | Pilihan 1-5 (Skor) |
| 5 | C5 | Status Rumah | Benefit | 8% | Pilihan 1-3 (Skor) |
| 6 | C6 | Luas Rumah (m²) | Cost | 6% | Angka (Number) |
| 7 | C7 | Daya Listrik (VA) | Cost | 5% | Pilihan (VA) |
| 8 | C8 | Jumlah Kendaraan | Cost | 5% | Angka (Number) |
| 9 | C9 | Tabungan (Rupiah) | Cost | 6% | Angka (Number) |
| 10 | C10 | Penghasilan per Bulan (Rp) | Cost | 15% | Angka (Number) |
| 11 | C11 | Pengeluaran per Bulan (Rp) | Benefit | 10% | Angka (Number) |
| 12 | C12 | Kondisi Dinding Rumah | Benefit | 8% | Pilihan 1-4 (Skor) |
| 13 | C13 | Akses Air Bersih | Benefit | 6% | Pilihan 1-3 (Skor) |
| | | **TOTAL** | | **100%** | |

#### Penjelasan Tipe Atribut
- **Benefit:** Semakin tinggi nilai, semakin baik kondisi (prioritas rendah untuk bansos)
  - Contoh: Anggota keluarga banyak, pendidikan tinggi, penghasilan tinggi, pengeluaran banyak
- **Cost:** Semakin rendah nilai, semakin baik (prioritas tinggi untuk bansos)
  - Contoh: Luas rumah kecil, daya listrik rendah, kendaraan banyak (menunjukkan kaya), tabungan banyak (kaya)

---

### 3.B Penentuan Bobot

#### Metode Penentuan Bobot

**Metode 1: Expert Judgement (AHP Simplified)**
```
Proses:
1. Kumpulkan stakeholder: Admin Desa, Kepala Desa, Petugas Desa, Akademisi
2. Diskusi kelompok terfokus (FGD) untuk mendiskusikan kepentingan setiap kriteria
3. Konsensus bersama tentang peringkat prioritas (misal: C10 penghasilan paling penting = 15%)
4. Distribusi bobot ke 13 kriteria sehingga total = 100%
5. Dokumentasi reasoning di meeting notes

Output: Versi Bobot V1.0 (dicatat dengan tanggal & peserta FGD)
```

**Metode 2: Sensitivity Analysis**
```
Proses:
1. Jalankan SAW dengan beberapa skenario bobot:
   - Skenario A: Fokus pada pengeluaran (C11 = 20%, C10 = 10%)
   - Skenario B: Fokus pada kondisi rumah (C6 + C12 + C13 = 25% total)
   - Skenario C: Fokus pada struktur keluarga (C1 + C2 = 20% total)
2. Bandingkan ranking hasil setiap skenario
3. Lihat mana skenario yang paling sesuai dengan misi pemerintah desa

Output: Wawasan tentang dampak perubahan bobot terhadap ranking
```

#### Penetapan Bobot Default (Rekomendasi)

Berdasarkan FGD dengan stakeholder & best practice, direkomendasikan bobot default:

```
Kelompok Fokus: Kondisi Ekonomi & Kesejahteraan Keluarga
- C10 Penghasilan per Bulan: 15% (indikator utama kemampuan ekonomi)
- C2  Jumlah Tanggungan: 10% (beban keluarga yang lebih berat prioritas)
- C4  Pekerjaan Kep. Keluarga: 10% (stabilitas pekerjaan)
- C11 Pengeluaran per Bulan: 10% (rasio pengeluaran vs penghasilan)

Kelompok Fokus: Kondisi Tempat Tinggal & Infrastruktur
- C12 Kondisi Dinding: 8% (indikator rumah layak)
- C5  Status Rumah: 8% (milik sendiri vs sewa)
- C6  Luas Rumah: 6% (standar rumah minimal)
- C13 Akses Air: 6% (akses air bersih)
- C7  Daya Listrik: 5% (akses energi)

Kelompok Fokus: Struktur Keluarga & Pendidikan
- C1  Jumlah Anggota Keluarga: 6% (ukuran keluarga)
- C9  Tabungan: 6% (kemampuan menabung)
- C8  Jumlah Kendaraan: 5% (aset kendaraan/kaya)
- C3  Pendidikan Kep. Keluarga: 5% (human capital)
```

#### Pemeliharaan & Verifikasi Bobot

Setiap kali bobot diubah:
1. Catat sebagai versi baru di tabel `bobot_kriteria` (tanggal, user, versi)
2. Jalankan SAW ulang dengan versi bobot baru
3. Bandingkan hasil ranking lama vs baru, lihat berapa banyak yang berubah
4. Dokumentasi alasan perubahan bobot

---

### 3.C Penyusunan Matriks Keputusan

#### Definisi Matriks Keputusan

Matriks keputusan **X** adalah tabel berukuran **m × n** di mana:
- **m** = jumlah alternatif (rumah tangga/warga) = 500–2000 baris
- **n** = jumlah kriteria = 13 kolom

```
       C1    C2    C3    C4    C5    C6    C7    C8    C9    C10   C11   C12   C13
A1   [x11  x12   x13   x14   x15   x16   x17   x18   x19   x1,10 x1,11 x1,12 x1,13]
A2   [x21  x22   x23   x24   x25   x26   x27   x28   x29   x2,10 x2,11 x2,12 x2,13]
A3   [x31  x32   x33   x34   x35   x36   x37   x38   x39   x3,10 x3,11 x3,12 x3,13]
...
Am   [xm1  xm2   xm3   xm4   xm5   xm6   xm7   xm8   xm9   xm,10 xm,11 xm,12 xm,13]
```

#### Proses Penyusunan Matriks

```
STEP 1: Query data warga dari database
  └─→ SELECT id, nik, nama, c1, c2, c3, ..., c13 FROM warga WHERE deleted_at IS NULL

STEP 2: Konversi nilai tekstual ke numerik
  ├─→ Kriteria Pilihan (C3, C4, C5, C7, C12, C13): Ambil skor langsung
  │   Contoh: C3 "SMA" → Skor 3
  ├─→ Kriteria Numerik (C1, C2, C6, C8, C9, C10, C11): Ambil nilai riil
  │   Contoh: C10 "Rp 1.500.000" → 1500000
  └─→ Validasi: semua nilai > 0, tidak ada NULL

STEP 3: Susun matriks X
  └─→ Data siap untuk tahap normalisasi

STEP 4: Simpan untuk audit trail
  └─→ Catat waktu pembuatan matriks, versi bobot yang digunakan
```

#### Contoh Data Matriks (Dummy untuk Ilustrasi)

```
Alternatif: 3 KK contoh
Periode: BLT Q1 2026
Bobot: V1.0 (default)

      C1  C2  C3  C4  C5  C6  C7  C8  C9    C10        C11        C12  C13
      (B) (B) (B) (B) (B) (C) (C) (C) (C)  (C)        (B)        (B)  (B)
A1    3   1   1   1   2   36  450 1   500k 1200k      1000k      2    1
A2    5   2   3   3   1   48  900 0   1.5M 2500k      1800k      3    2
A3    4   3   5   5   3   72  2200 2  3M   5000k      2000k      4    3
```

---

### 3.D Proses Perhitungan Metode SAW

Perhitungan SAW terdiri dari 3 langkah besar: **Normalisasi → Perhitungan Preferensi → Perangkingan**

#### **LANGKAH 1: Normalisasi Matriks Keputusan**

Untuk setiap elemen matriks X, hitung nilai normalisasi R menggunakan rumus:

**Untuk Kriteria BENEFIT (semakin tinggi semakin baik):**
$$r_{ij} = \frac{x_{ij}}{\max(x_j)}$$

**Untuk Kriteria COST (semakin rendah semakin baik):**
$$r_{ij} = \frac{\min(x_j)}{x_{ij}}$$

Di mana:
- $r_{ij}$ = nilai normalisasi alternatif i pada kriteria j
- $x_{ij}$ = nilai asli alternatif i pada kriteria j
- $\max(x_j)$ = nilai maksimum dari seluruh alternatif di kriteria j
- $\min(x_j)$ = nilai minimum dari seluruh alternatif di kriteria j

**Contoh Perhitungan Normalisasi:**

Kolom C1 (Anggota Keluarga = BENEFIT):
```
A1: x11 = 3,  A2: x21 = 5,  A3: x31 = 4
max(C1) = 5

r11 = 3/5 = 0.60
r21 = 5/5 = 1.00
r31 = 4/5 = 0.80
```

Kolom C6 (Luas Rumah = COST):
```
A1: x16 = 36,  A2: x26 = 48,  A3: x36 = 72
min(C6) = 36

r16 = 36/36 = 1.00
r26 = 36/48 = 0.75
r36 = 36/72 = 0.50
```

**Hasil Matriks Normalisasi R:**
```
      C1    C2    C3    C4    C5    C6    C7    C8    C9    C10   C11   C12   C13
R1   [0.60  0.33  0.20  0.20  0.67  1.00  1.00  1.00  0.17  0.24  0.50  0.50  0.33]
R2   [1.00  0.67  0.60  0.60  1.00  0.75  1.00  1.00  0.50  0.50  0.90  0.75  0.67]
R3   [0.80  1.00  1.00  1.00  1.00  0.50  0.20  0.50  1.00  1.00  1.00  1.00  1.00]
```

#### **LANGKAH 2: Perhitungan Nilai Preferensi (Score)**

Untuk setiap alternatif i, hitung nilai preferensi Vi menggunakan rumus:

$$V_i = \sum_{j=1}^{n} w_j \times r_{ij}$$

Di mana:
- $V_i$ = nilai preferensi alternatif i
- $w_j$ = bobot kriteria j (dalam desimal, total = 1.0)
- $r_{ij}$ = nilai normalisasi alternatif i pada kriteria j
- $n$ = jumlah kriteria = 13

**Bobot Desimal (dari % ke desimal):**
```
C1:  6%  = 0.06    C8:  5%  = 0.05
C2:  10% = 0.10    C9:  6%  = 0.06
C3:  5%  = 0.05    C10: 15% = 0.15
C4:  10% = 0.10    C11: 10% = 0.10
C5:  8%  = 0.08    C12: 8%  = 0.08
C6:  6%  = 0.06    C13: 6%  = 0.06
C7:  5%  = 0.05
Total: 1.00
```

**Contoh Perhitungan Preferensi untuk A1:**
```
V1 = (0.06 × 0.60) + (0.10 × 0.33) + (0.05 × 0.20) + (0.10 × 0.20) + (0.08 × 0.67)
   + (0.06 × 1.00) + (0.05 × 1.00) + (0.05 × 1.00) + (0.06 × 0.17) + (0.15 × 0.24)
   + (0.10 × 0.50) + (0.08 × 0.50) + (0.06 × 0.33)

V1 = 0.036 + 0.033 + 0.010 + 0.020 + 0.054
   + 0.060 + 0.050 + 0.050 + 0.010 + 0.036
   + 0.050 + 0.040 + 0.020

V1 = 0.469
```

**Contoh Perhitungan Preferensi untuk A2:**
```
V2 = (0.06 × 1.00) + (0.10 × 0.67) + (0.05 × 0.60) + (0.10 × 0.60) + (0.08 × 1.00)
   + (0.06 × 0.75) + (0.05 × 1.00) + (0.05 × 1.00) + (0.06 × 0.50) + (0.15 × 0.50)
   + (0.10 × 0.90) + (0.08 × 0.75) + (0.06 × 0.67)

V2 = 0.060 + 0.067 + 0.030 + 0.060 + 0.080
   + 0.045 + 0.050 + 0.050 + 0.030 + 0.075
   + 0.090 + 0.060 + 0.040

V2 = 0.697
```

**Contoh Perhitungan Preferensi untuk A3:**
```
V3 = (0.06 × 0.80) + (0.10 × 1.00) + (0.05 × 1.00) + (0.10 × 1.00) + (0.08 × 1.00)
   + (0.06 × 0.50) + (0.05 × 0.20) + (0.05 × 0.50) + (0.06 × 1.00) + (0.15 × 1.00)
   + (0.10 × 1.00) + (0.08 × 1.00) + (0.06 × 1.00)

V3 = 0.048 + 0.100 + 0.050 + 0.100 + 0.080
   + 0.030 + 0.010 + 0.025 + 0.060 + 0.150
   + 0.100 + 0.080 + 0.060

V3 = 0.893
```

**Tabel Nilai Preferensi Akhir:**
```
Alternatif  Nilai Preferensi (Vi)
A1          0.469
A2          0.697
A3          0.893
```

#### **LANGKAH 3: Perangkingan**

Urutkan semua alternatif berdasarkan nilai Vi secara **DESCENDING** (dari terbesar ke terkecil):

```
Ranking  Alternatif  Nama/NIK     Nilai Vi   Status
1        A3          3402/... (4 orang)  0.893     Penerima (dalam kuota 150)
2        A2          3401/... (5 orang)  0.697     Penerima (dalam kuota 150)
3        A1          3403/... (3 orang)  0.469     Cadangan (di atas kuota)
```

---

### 3.E Perankingan & Penentuan Status Penerima

#### Proses Penentuan Status

```
RANKING 1-150 (berdasarkan kuota)
  └─→ Status: ✅ PENERIMA (berhak menerima Rp 500.000 - Rp 1.000.000)

RANKING 151-155 (5 di atas kuota sebagai cadangan)
  └─→ Status: ⏳ CADANGAN (siap jika ada penerima yang mengundur diri)

RANKING 156+ (sisanya)
  └─→ Status: ❌ TIDAK LOLOS (belum layak prioritas bansos)
```

#### Tampilan Hasil Ranking Final

| Rank | NIK | Nama | RT/RW | Anggota | Penghasilan | Nilai Vi | Status | Catatan |
|:----:|-----|------|-------|---------|-------------|----------|--------|---------|
| 1 | 3402202501990001 | Budi Santoso | 01/01 | 4 | Rp 1.2M | 0.893 | ✅ Penerima | - |
| 2 | 3401202512010005 | Siti Nurhaliza | 02/02 | 5 | Rp 2.5M | 0.697 | ✅ Penerima | - |
| 3 | 3403202506020003 | Agus Hermawan | 03/03 | 3 | Rp 1.5M | 0.469 | ⏳ Cadangan | Jika ada yang mundur |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

#### Output Sistem ke Pengambil Keputusan

1. **Dashboard:** Visualisasi Top 10 penerima, statistik (total penerima, total kuota, presentase terpenuhi)
2. **Laporan PDF:** SK resmi penerima BLT dengan kop desa, tandatangan Kepala Desa digital
3. **Laporan Excel:** Tabel lengkap ranking untuk dianalisis lebih lanjut
4. **Log Audit:** Riwayat siapa menjalankan SAW, kapan, versi bobot apa yang digunakan

---

## Ringkasan Metodologi

```
INPUT DATA (13 kriteria × 500-2000 warga)
  ↓
NORMALISASI (BENEFIT & COST)
  ↓
PERHITUNGAN PREFERENSI (Vi = Σ bobot × nilai norm)
  ↓
PERANGKINGAN (Sort Vi descending)
  ↓
OUTPUT: Ranking dengan status (Penerima/Cadangan/Tidak Lolos)
  ↓
LAPORAN: SK, PDF ranking, Excel, Audit Log
```

---

**Dokumentasi & Referensi:**
- SAW Algorithm: Fishburn, P. C. (1967). Additive utilities with incomplete product sets.
- Dataset Kaggle: https://www.kaggle.com/datasets/bgapicode/bantuan-sosial-klasifikasi
- Regulasi BPS: Standar Indikator Kesejahteraan Sosial
- Project Brief: SIPBANSOS PRD v2.0