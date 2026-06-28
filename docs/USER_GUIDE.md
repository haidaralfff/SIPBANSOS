# 📖 USER GUIDE - SIPBANSOS
### Sistem Informasi Penentu Bantuan Sosial (BLT Desa / Kelurahan)

Selamat datang di **USER GUIDE SIPBANSOS**! Dokumen ini dirancang sebagai panduan komprehensif untuk membantu seluruh pengguna (Administrator, Kepala Desa, Petugas Survei, dan Operator RW/RT) dalam mengoperasikan aplikasi web SIPBANSOS secara efektif, transparan, dan terstruktur.

---

## 📋 Daftar Isi
1. [📌 Pendahuluan](#-pendahuluan)
2. [🔐 Peran Pengguna & Hak Akses (RBAC)](#-peran-pengguna--hak-akses-rbac)
3. [🚪 Panduan Login & Navigasi Utama](#-panduan-login--navigasi-utama)
4. [👥 Manajemen Data Warga](#-manajemen-data-warga)
5. [📥 Modul Import & Ekspor Data](#-modul-import--ekspor-data)
6. [⚖️ Konfigurasi Kriteria & Bobot SAW](#️-konfigurasi-kriteria--bobot-saw)
7. [🧮 Perhitungan & Simulasi SAW](#-perhitungan--simulasi-saw)
8. [📊 Laporan & Pemeringkatan Bansos](#-laporan--pemeringkatan-bansos)
9. [⚙️ Manajemen Pengguna & Pengaturan Sistem](#️-manajemen-pengguna--pengaturan-sistem)
10. [❓ Pertanyaan Umum & Troubleshooting (FAQ)](#-pertanyaan-umum--troubleshooting-faq)

---

## 📌 Pendahuluan

**SIPBANSOS** adalah aplikasi micro-ERP tingkat desa/kelurahan yang membantu unit pemerintah mengotomatisasi seleksi, pemeringkatan, dan penetapan penerima **Bantuan Langsung Tunai (BLT)**.

Sistem ini menerapkan metode ilmiah **Simple Additive Weighting (SAW)** yang mengolah **13 Indikator Kesejahteraan** warga untuk menghasilkan pemeringkatan objektif, adil, transparan, serta dilengkapi dengan jejak audit (*audit log*) otomatis.

---

## 🔐 Peran Pengguna & Hak Akses (RBAC)

Aplikasi memiliki 4 tingkatan peran (*role*) pengguna dengan batasan akses sesuai dengan wewenang operasionalnya:

### 🎭 Matriks Hak Akses Modul

| Modul / Fitur | Admin | Kepala Desa | Petugas Survei | Operator RW/RT |
| :--- | :---: | :---: | :---: | :---: |
| **Overview / Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Data Warga** (Lihat & Input) | ✅ | ✅ | ✅ | ✅ |
| **Import / Ekspor Data Massal** | ✅ | ❌ | ✅ | ❌ |
| **Kriteria & Bobot** | ✅ | ❌ | ❌ | ❌ |
| **Perhitungan & Simulasi SAW** | ✅ | ✅ | ❌ | ❌ |
| **Laporan & Cetak Hasil** | ✅ | ✅ | ❌ | ❌ |
| **Manajemen Pengguna** | ✅ | ❌ | ❌ | ❌ |
| **Pengaturan Periode & Audit Log**| ✅ | ❌ | ❌ | ❌ |

### 🔑 Akun Default untuk Pengujian

| Username | Password | Role | Peruntukan |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin123!` | Admin | Administrator Utama Sistem |
| `kades` | `Kades123!` | Kepala Desa | Penentu Kebijakan & Verifikator Akhir |
| `petugas` | `Petugas123!` | Petugas Survei | Pengumpul & Verifikator Data Lapangan |
| `operator` | `Operator123!` | Operator RW/RT | Pendata Warga Tingkat RT/RW |

---

## 🚪 Panduan Login & Navigasi Utama

### 1. Cara Login ke Aplikasi
1. Buka browser dan kunjungi alamat aplikasi SIPBANSOS (misal: `http://localhost:5173`).
2. Masukkan **Username** dan **Password** Anda pada halaman login.
3. Klik tombol **Masuk ke Sistem**.
4. Apabila kredensial benar, Anda akan diarahkan ke halaman **Overview / Dashboard**.

### 2. Navigasi Antarmuka (UI Layout)
Antarmuka SIPBANSOS terdiri dari 3 area utama:
- **Sidebar (Kiri)**: Berisi menu navigasi yang menyesuaikan dengan role Anda, serta widget informasi **Kuota Periode Aktif**.
- **Header (Atas)**: Berisi pencarian cepat, ucapan selamat datang, indikator role, serta tombol **Profil & Logout**.
- **Konten Utama (Tengah)**: Area kerja untuk melihat grafik, mengelola tabel data, atau mengunduh laporan.

---

## 👥 Manajemen Data Warga

Modul ini digunakan untuk mencatat dan mendokumentasikan calon penerima bantuan beserta 13 indikator kondisi sosial ekonomi keluarga.

### ➕ Menambah Data Warga Baru
1. Masuk ke menu **Data Warga** pada Sidebar.
2. Klik tombol **+ Tambah Warga**.
3. Isi data identitas diri (NIK, Nama Lengkap, No. KK, Alamat, RT/RW, dsb).
4. Isi **13 Indikator Kesejahteraan**:
   - **C1**: Jumlah Anggota Keluarga
   - **C2**: Jumlah Tanggungan
   - **C3**: Pendidikan Kepala Keluarga
   - **C4**: Pekerjaan Kepala Keluarga
   - **C5**: Status Kepemilikan Rumah
   - **C6**: Luas Bangunan Rumah ($m^2$)
   - **C7**: Daya Listrik Terpasang (VA)
   - **C8**: Jumlah Kendaraan Beroda 2/4
   - **C9**: Perkiraan Tabungan/Aset
   - **C10**: Total Penghasilan Per Bulan
   - **C11**: Total Pengeluaran Per Bulan
   - **C12**: Kondisi Dinding Rumah
   - **C13**: Sumber Akses Air Bersih
5. Klik **Simpan Data**. Data warga baru secara otomatis berstatus *Pending / Belum Diverifikasi*.

### ✏️ Mengubah & Menghapus Data Warga
- **Edit**: Klik ikon pensil 📝 pada baris warga yang ingin diubah, lakukan pembaruan data, lalu klik **Simpan**.
- **Hapus**: Klik ikon tong sampah 🗑️ pada baris warga. *Catatan: Menghapus data warga akan menghapus riwayat penilaian warga tersebut dari sistem.*

---

## 📥 Modul Import & Ekspor Data

*(Akses: Admin & Petugas Survei)*

Modul ini mempermudah pencatatan data warga dalam jumlah besar sekaligus tanpa harus diinput satu per satu.

### 📄 Mengunggah / Import Data Massal
1. Masuk ke menu **Import / Ekspor**.
2. Klik **Unduh Template Excel/CSV** untuk mendapatkan format kolom data yang sesuai.
3. Buka berkas template dan isi data warga sesuai panduan petunjuk kolom.
4. Simpan berkas (format `.csv` atau `.xlsx`).
5. Kembali ke halaman Import pada aplikasi, unggah berkas dengan drag & drop atau klik area unggah.
6. Klik **Pratinjau Data** untuk mengecek validasi kesalahan baris.
7. Jika data sudah benar, klik **Proses Import Massal**.

---

## ⚖️ Konfigurasi Kriteria & Bobot SAW

*(Akses: Admin)*

Penetapan penerima bantuan didasarkan pada metode **Simple Additive Weighting (SAW)**. Admin memiliki wewenang untuk menyesuaikan bobot dan sifat indikator sesuai kebijakan wilayah setempat.

### 💡 Pemahaman Sifat Kriteria
- **Benefit (Keuntungan)**: Semakin tinggi nilainya, semakin besar peluang warga tersebut menerima bantuan (contoh: *Jumlah Tanggungan*, *Pengeluaran*).
- **Cost (Biaya/Beban)**: Semakin kecil nilainya, semakin besar peluang warga tersebut menerima bantuan (contoh: *Penghasilan*, *Daya Listrik*, *Jumlah Kendaraan*).

### ⚙️ Mengatur Bobot Kriteria
1. Masuk ke menu **Kriteria & Bobot**.
2. Anda akan melihat daftar 13 kriteria beserta bobot persentase saat ini.
3. Klik tombol **Edit Bobot**.
4. Sesuaikan nilai bobot masing-masing kriteria. **PENTING**: Total seluruh bobot kriteria harus persis berjumlah **100% (atau 1.00)**.
5. Klik **Simpan Perubahan Bobot**.

---

## 🧮 Perhitungan & Simulasi SAW

*(Akses: Admin & Kepala Desa)*

Modul ini digunakan untuk menjalankan kalkulasi matematis objektif untuk menetapkan penerima Bansos berdasarkan periode aktif.

### 🚀 Langkah Menjalankan Simulasi
1. Masuk ke menu **Perhitungan SAW**.
2. Pastikan **Periode Bansos Aktif** sudah terpilih (misal: *BLT Tahap 1 - 2026*).
3. Klik tombol **Jalankan Kalkulasi SAW**.
4. Sistem akan secara otomatis melakukan:
   - **Pembentukan Matriks Keputusan** dari data 13 indikator warga.
   - **Normalisasi Matriks** (Penyesuaian skala berdasarkan kriteria Benefit/Cost).
   - **Perhitungan Nilai Preferensi ($V_i$)** dengan mengalikan matriks normalisasi dan bobot.
5. Sistem akan menampilkan tabel **Hasil Pemeringkatan / Ranking** dari skor tertinggi hingga terendah.

---

## 📊 Laporan & Pemeringkatan Bansos

*(Akses: Admin & Kepala Desa)*

Setelah kalkulasi selesai, modul Laporan menampilkan daftar warga yang memenuhi syarat kuota penerima.

### 🏆 Memahami Kelompok Kelayakan
Sistem membagi warga menjadi 3 kategori secara otomatis berdasarkan Kuota Periode:
1. **Lolos (Penerima)**: Warga peringkat 1 hingga batas kuota maksimal (misal: Kuota 50 KK).
2. **Cadangan**: Warga di bawah kuota penerima yang siap menggantikan jika ada pembatalan.
3. **Tidak Lolos**: Warga dengan skor preferensi terendah.

### 🖨️ Mengunduh Laporan Resmi
1. Masuk ke menu **Laporan**.
2. Gunakan filter **Periode Bansos** atau **RT/RW** jika diperlukan.
3. Klik tombol **Ekspor PDF** untuk mencetak dokumen siap tanda tangan Kepala Desa.
4. Klik tombol **Ekspor Excel** jika ingin mengolah data lebih lanjut dalam bentuk spreadsheet.

---

## ⚙️ Manajemen Pengguna & Pengaturan Sistem

*(Akses: Admin)*

### 👤 Pengelolaan Akun Pengguna
- **Tambah User**: Klik menu **Pengguna** ➡️ **+ Tambah Pengguna Baru**, isi username, email, password, dan tentukan role (*Admin / Kepala Desa / Petugas / Operator*).
- **Nonaktifkan/Edit User**:Ubah hak akses atau kata sandi pengguna jika terjadi pergantian personel desa.

### 📅 Manajemen Periode Bansos & Kuota
1. Masuk ke menu **Pengaturan** ➡️ Tab **Periode Bansos**.
2. Klik **+ Buat Periode Baru**.
3. Masukkan Nama Periode (misal: *BLT Desa Triwulan 3*), Tahun, dan **Jumlah Kuota Penerima (KK)**.
4. Atur status periode menjadi **Aktif**. *(Catatan: Hanya boleh ada 1 periode aktif dalam satu waktu).*

### 📜 Audit Log (Jejak Aktivitas)
Seluruh aksi penting (seperti ubah bobot, ubah data warga, kalkulasi SAW, login) tercatat secara otomatis di menu **Pengaturan ➡️ Audit Log**. Data ini bersifat *immutable* (tidak dapat dihapus atau dimanipulasi) guna menjaga keandalan audit transparansi desa.

---

## ❓ Pertanyaan Umum & Troubleshooting (FAQ)

<details>
<summary><b>1. Mengapa tombol "Jalankan Kalkulasi SAW" tidak aktif atau error?</b></summary>
<p>
Pastikan terdapat **Periode Bansos yang berstatus Aktif** pada menu Pengaturan, dan pastikan data warga pada periode tersebut sudah tersedia/diverifikasi. Selain itu, pastikan total akumulasi bobot kriteria berjumlah 100%.
</p>
</details>

<details>
<summary><b>2. Bagaimana jika warga tidak memiliki tabungan atau aset?</b></summary>
<p>
Pada isian indikator **C9 (Tabungan/Aset)**, pilih opsi dengan nilai terkecil atau isi 0 sesuai dengan acuan petunjuk skala pada form input warga.
</p>
</details>

<details>
<summary><b>3. Siapa yang berhak menyetujui laporan akhir penerima Bansos?</b></summary>
<p>
Kepala Desa dapat meninjau hasil kalkulasi pada menu <b>Laporan</b> dan mengunduh berkas PDF untuk disahkan dalam Musyawarah Desa (Musdes).
</p>
</details>

---

*SIPBANSOS — Mewujudkan Penyaluran Bantuan Sosial Desa yang Ojektif, Transparan, dan Akuntabel.* 🚀
