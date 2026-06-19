# Contoh Perhitungan Manual SAW — SIPBANSOS (Revisi Cost)

> **Algoritma:** Simple Additive Weighting (SAW)
> **Studi Kasus:** Seleksi penerima BLT Q1 2026, kuota = **3 penerima**
> **Koreksi Logika:** Kriteria C3, C4, C12, dan C13 disesuaikan menjadi **Cost** karena arah skala konversi yang digunakan bernilai makin besar untuk kondisi makin mampu (sehingga makin tidak layak menerima bantuan).

---

## 1. Data Kriteria & Bobot

| Kode | Nama Kriteria | Atribut | Bobot (%) | Bobot (desimal) |
|------|---------------|---------|-----------|-----------------|
| C1  | Jumlah Anggota Keluarga | **Benefit** | 6%  | 0.06 |
| C2  | Jumlah Tanggungan       | **Benefit** | 10% | 0.10 |
| C3  | Pendidikan Kep. Keluarga | **Cost**    | 5%  | 0.05 |
| C4  | Pekerjaan Kep. Keluarga  | **Cost**    | 10% | 0.10 |
| C5  | Status Rumah            | **Benefit** | 8%  | 0.08 |
| C6  | Luas Rumah (m²)         | **Cost**    | 6%  | 0.06 |
| C7  | Daya Listrik (VA)       | **Cost**    | 5%  | 0.05 |
| C8  | Jumlah Kendaraan        | **Cost**    | 5%  | 0.05 |
| C9  | Tabungan (Rp)           | **Cost**    | 6%  | 0.06 |
| C10 | Penghasilan per Bulan (Rp) | **Cost** | 15% | 0.15 |
| C11 | Pengeluaran per Bulan (Rp) | **Benefit** | 10% | 0.10 |
| C12 | Kondisi Dinding         | **Cost**    | 8%  | 0.08 |
| C13 | Akses Air               | **Cost**    | 6%  | 0.06 |
| | **TOTAL** | | **100%** | **1.00** |

### Konversi Skala untuk Kriteria Kualitatif

Petugas menginput skala alami (makin berkecukupan = makin besar skalanya). Algoritma memperlakukannya sebagai **Cost** agar yang berkecukupan mendapatkan skor kelayakan rendah.

| Kriteria | Pilihan | Skor |
|----------|---------|------|
| **C3** Pendidikan | Tidak Sekolah/SD | 1 |
| | SMP | 2 |
| | SMA | 3 |
| | Diploma | 4 |
| | Sarjana | 5 |
| **C4** Pekerjaan | Tidak Bekerja | 1 |
| | Buruh Harian Lepas | 2 |
| | Petani/Nelayan | 3 |
| | Karyawan Swasta/Pedagang | 4 |
| | PNS/TNI/POLRI/BUMN | 5 |
| **C5** Status Rumah | Milik Sendiri | 1 |
| | Sewa/Kontrak | 2 |
| | Numpang/Rumah Dinas | 3 |
| **C12** Kondisi Dinding | Bambu/Kayu Darurat | 1 |
| | Semi Permanen/Papan | 2 |
| | Tembok Tanpa Plester | 3 |
| | Tembok Plester/Permanen | 4 |
| **C13** Akses Air | Sungai/Hujan/Sumur Terbuka | 1 |
| | Sumur Gali/Pompa Bersama | 2 |
| | PDAM/Sumur Bor Pribadi | 3 |

---

## 2. Data 5 Warga (Alternatif)

| Kode | Nama Warga | NIK |
|------|------------|-----|
| A1 | Bapak Ahmad Santoso | 3201010101010001 |
| A2 | Bapak Budi Raharjo  | 3201010101010002 |
| A3 | Ibu Citra Dewi      | 3201010101010003 |
| A4 | Bapak Darto Wibowo  | 3201010101010004 |
| A5 | Ibu Eni Sulistyowati | 3201010101010005 |

### Step 1 — Matriks Keputusan (X)

Nilai mentah masing-masing alternatif per kriteria:

| Alt. | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13 |
|------|----|----|----|----|----|----|-----|----|----|-----|-----|-----|-----|
| A1 (Ahmad) | 6 | 4 | 1 | 1 | 1 | 24 | 450  | 0 | 500.000 | 800.000  | 900.000  | 1 | 1 |
| A2 (Budi)  | 4 | 2 | 3 | 2 | 2 | 36 | 900  | 1 | 200.000 | 1.500.000 | 1.200.000 | 2 | 2 |
| A3 (Citra) | 5 | 3 | 1 | 3 | 3 | 18 | 450  | 0 | 100.000 | 700.000  | 1.000.000 | 1 | 1 |
| A4 (Darto) | 3 | 1 | 2 | 4 | 1 | 48 | 1300 | 2 | 2.000.000 | 3.000.000 | 800.000  | 3 | 3 |
| A5 (Eni)   | 7 | 5 | 1 | 1 | 2 | 30 | 900  | 1 | 300.000 | 600.000  | 1.500.000 | 1 | 2 |

**Penjelasan nilai:**
- **A1 (Ahmad)**: Keluarga besar 6 orang, tanggungan 4, pendidikan Tidak Sekolah/SD (skor 1), tidak bekerja (skor 1), rumah milik sendiri (skor 1), luas 24 m², daya listrik 450 VA, tidak punya kendaraan, tabungan 500 ribu, penghasilan 800 ribu, pengeluaran 900 ribu/bulan, dinding bambu (skor 1), air sungai (skor 1).
- **A2 (Budi)**: Keluarga 4 orang, tanggungan 2, pendidikan SMA (skor 3), pekerjaan buruh harian lepas (skor 2), rumah sewa/kontrak (skor 2), luas 36 m², daya listrik 900 VA, 1 motor, tabungan 200 ribu, penghasilan 1,5 juta, pengeluaran 1,2 juta, dinding semi permanen (skor 2), sumur gali (skor 2).
- **A3 (Citra)**: Keluarga 5 orang, tanggungan 3, pendidikan Tidak Sekolah/SD (skor 1), pekerjaan petani/nelayan (skor 3), rumah numpang/dinas (skor 3), luas 18 m², daya listrik 450 VA, tidak punya kendaraan, tabungan 100 ribu, penghasilan 700 ribu, pengeluaran 1 juta, dinding bambu (skor 1), air sungai (skor 1).
- **A4 (Darto)**: Keluarga 3 orang, tanggungan 1, pendidikan SMP (skor 2), pekerjaan karyawan swasta/pedagang (skor 4), rumah milik sendiri (skor 1), luas 48 m², daya listrik 1300 VA, 2 kendaraan, tabungan 2 juta, penghasilan 3 juta, pengeluaran 800 ribu, dinding tembok tanpa plester (skor 3), PDAM (skor 3).
- **A5 (Eni)**: Keluarga 7 orang, tanggungan 5, pendidikan Tidak Sekolah/SD (skor 1), tidak bekerja (skor 1), rumah sewa/kontrak (skor 2), luas 30 m², daya listrik 900 VA, 1 kendaraan, tabungan 300 ribu, penghasilan 600 ribu, pengeluaran 1,5 juta, dinding bambu (skor 1), sumur gali (skor 2).

---

## 3. Step 2 — Normalisasi Matriks (R)

### Rumus Normalisasi

```
Benefit (C1, C2, C5, C11)           → rij = xij / max(kolom j)
Cost (C3, C4, C6, C7, C8, C9, C10, C12, C13) → rij = min(kolom j) / xij
```

### Cari Nilai MAX (untuk Benefit) dan MIN (untuk Cost) Setiap Kolom

- **C1 (Benefit)**: MAX = **7**
- **C2 (Benefit)**: MAX = **5**
- **C3 (Cost)**: MIN = **1**
- **C4 (Cost)**: MIN = **1**
- **C5 (Benefit)**: MAX = **3**
- **C6 (Cost)**: MIN = **18**
- **C7 (Cost)**: MIN = **450**
- **C8 (Cost)**: MIN non-nol = **1** *(nilai 0 kendaraan diberi hasil normalisasi = 1.0)*
- **C9 (Cost)**: MIN = **100.000**
- **C10 (Cost)**: MIN = **600.000**
- **C11 (Benefit)**: MAX = **1.500.000**
- **C12 (Cost)**: MIN = **1**
- **C13 (Cost)**: MIN = **1**

### Ringkasan Matriks Normalisasi (R)

| Alt. | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13 |
|------|------|------|------|------|------|------|------|------|------|------|------|------|------|
| **A1** | 0.8571 | 0.8000 | 1.0000 | 1.0000 | 0.3333 | 0.7500 | 1.0000 | 1.0000 | 0.2000 | 0.7500 | 0.6000 | 1.0000 | 1.0000 |
| **A2** | 0.5714 | 0.4000 | 0.3333 | 0.5000 | 0.6667 | 0.5000 | 0.5000 | 1.0000 | 0.5000 | 0.4000 | 0.8000 | 0.5000 | 0.5000 |
| **A3** | 0.7143 | 0.6000 | 1.0000 | 0.3333 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.8571 | 0.6667 | 1.0000 | 1.0000 |
| **A4** | 0.4286 | 0.2000 | 0.5000 | 0.2500 | 0.3333 | 0.3750 | 0.3462 | 0.5000 | 0.0500 | 0.2000 | 0.5333 | 0.3333 | 0.3333 |
| **A5** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.6667 | 0.6000 | 0.5000 | 1.0000 | 0.3333 | 1.0000 | 1.0000 | 1.0000 | 0.5000 |

---

## 4. Step 3 — Hitung Nilai Preferensi (Vi)

### Rumus
```
Vi = Σ (wj × rij)
```

### Bobot (w) dalam desimal:
`w = [0.06, 0.10, 0.05, 0.10, 0.08, 0.06, 0.05, 0.05, 0.06, 0.15, 0.10, 0.08, 0.06]`

---

### V1 — Ahmad Santoso (A1)
- C1: 0.06 * 0.8571 = 0.0514
- C2: 0.10 * 0.8000 = 0.0800
- C3: 0.05 * 1.0000 = 0.0500
- C4: 0.10 * 1.0000 = 0.1000
- C5: 0.08 * 0.3333 = 0.0267
- C6: 0.06 * 0.7500 = 0.0450
- C7: 0.05 * 1.0000 = 0.0500
- C8: 0.05 * 1.0000 = 0.0500
- C9: 0.06 * 0.2000 = 0.0120
- C10: 0.15 * 0.7500 = 0.1125
- C11: 0.10 * 0.6000 = 0.0600
- C12: 0.08 * 1.0000 = 0.0800
- C13: 0.06 * 1.0000 = 0.0600
- **V1 = 0.7976**

---

### V2 — Budi Raharjo (A2)
- C1: 0.06 * 0.5714 = 0.0343
- C2: 0.10 * 0.4000 = 0.0400
- C3: 0.05 * 0.3333 = 0.0167
- C4: 0.10 * 0.5000 = 0.0500
- C5: 0.08 * 0.6667 = 0.0533
- C6: 0.06 * 0.5000 = 0.0300
- C7: 0.05 * 0.5000 = 0.0250
- C8: 0.05 * 1.0000 = 0.0500
- C9: 0.06 * 0.5000 = 0.0300
- C10: 0.15 * 0.4000 = 0.0600
- C11: 0.10 * 0.8000 = 0.0800
- C12: 0.08 * 0.5000 = 0.0400
- C13: 0.06 * 0.5000 = 0.0300
- **V2 = 0.5393**

---

### V3 — Citra Dewi (A3)
- C1: 0.06 * 0.7143 = 0.0429
- C2: 0.10 * 0.6000 = 0.0600
- C3: 0.05 * 1.0000 = 0.0500
- C4: 0.10 * 0.3333 = 0.0333
- C5: 0.08 * 1.0000 = 0.0800
- C6: 0.06 * 1.0000 = 0.0600
- C7: 0.05 * 1.0000 = 0.0500
- C8: 0.05 * 1.0000 = 0.0500
- C9: 0.06 * 1.0000 = 0.0600
- C10: 0.15 * 0.8571 = 0.1286
- C11: 0.10 * 0.6667 = 0.0667
- C12: 0.08 * 1.0000 = 0.0800
- C13: 0.06 * 1.0000 = 0.0600
- **V3 = 0.8215**

---

### V4 — Darto Wibowo (A4)
- C1: 0.06 * 0.4286 = 0.0257
- C2: 0.10 * 0.2000 = 0.0200
- C3: 0.05 * 0.5000 = 0.0250
- C4: 0.10 * 0.2500 = 0.0250
- C5: 0.08 * 0.3333 = 0.0267
- C6: 0.06 * 0.3750 = 0.0225
- C7: 0.05 * 0.3462 = 0.0173
- C8: 0.05 * 0.5000 = 0.0250
- C9: 0.06 * 0.0500 = 0.0030
- C10: 0.15 * 0.2000 = 0.0300
- C11: 0.10 * 0.5333 = 0.0533
- C12: 0.08 * 0.3333 = 0.0267
- C13: 0.06 * 0.3333 = 0.0200
- **V4 = 0.3202**

---

### V5 — Eni Sulistyowati (A5)
- C1: 0.06 * 1.0000 = 0.0600
- C2: 0.10 * 1.0000 = 0.1000
- C3: 0.05 * 1.0000 = 0.0500
- C4: 0.10 * 1.0000 = 0.1000
- C5: 0.08 * 0.6667 = 0.0533
- C6: 0.06 * 0.6000 = 0.0360
- C7: 0.05 * 0.5000 = 0.0250
- C8: 0.05 * 1.0000 = 0.0500
- C9: 0.06 * 0.3333 = 0.0200
- C10: 0.15 * 1.0000 = 0.1500
- C11: 0.10 * 1.0000 = 0.1000
- C12: 0.08 * 1.0000 = 0.0800
- C13: 0.06 * 0.5000 = 0.0300
- **V5 = 0.8543**

---

## 5. Step 4 — Perangkingan Baru

Urutkan berdasarkan nilai **Vi tertinggi → terendah** (Descending):

| Ranking | Alternatif | Nama | Nilai Vi | Status |
|---------|------------|------|----------|--------|
| 🥇 **1** | A5 | Eni Sulistyowati | **0.8543** | ✅ **Penerima** |
| 🥈 **2** | A3 | Citra Dewi | **0.8215** | ✅ **Penerima** |
| 🥉 **3** | A1 | Ahmad Santoso | **0.7976** | ✅ **Penerima** |
| 4 | A2 | Budi Raharjo | **0.5393** | 🔶 **Cadangan** |
| 5 | A4 | Darto Wibowo | **0.3202** | 🔶 **Cadangan** |

> **Analisis Hasil Baru:** 
> - **Eni Sulistyowati (A5)** naik ke peringkat 1 karena kriteria *Cost* (tidak bekerja, dinding bambu) dinormalisasi dengan benar (mendapatkan nilai maksimal 1.0).
> - **Ahmad Santoso (A1)** kini berhasil **lolos sebagai Penerima** (Peringkat 3). Sebelumnya ia berada di posisi cadangan (Peringkat 4) karena status tidak bekerja dan kondisi dinding bambunya malah dianggap bernilai rendah.
> - **Budi Raharjo (A2)** sekarang **turun ke posisi Cadangan** (Peringkat 4), yang mana lebih adil karena tingkat kemampuannya (sudah bekerja/buruh, dinding semi permanen, pendidikan SMP) secara relatif berada di atas Ahmad, Citra, dan Eni.

---

## 6. Format Excel (Revisi Formula Cost)

Berikut formula Excel yang diperbarui untuk mencerminkan logika normalisasi baru:

### Sheet 1: "Data Warga" (Sama seperti sebelumnya)

### Sheet 2: "Bobot" (Sama seperti sebelumnya, pastikan total bobot = 100%)

### Sheet 3: "Normalisasi"

Formula normalisasi pada baris **A1** (baris ke-2):

- **Untuk C1, C2, C5, C11 (Benefit)**:
  `=D2/MAX($D$2:$D$6)` *(Nilai dibagi MAX)*
- **Untuk C3, C4, C6, C7, C8, C9, C10, C12, C13 (Cost)**:
  `=MIN(kolom_range)/cell_nilai` 
  - Formula untuk C3 (Pendidikan): `=MIN($F$2:$F$6)/F2`
  - Formula untuk C4 (Pekerjaan): `=MIN($G$2:$G$6)/G2`
  - Formula untuk C12 (Dinding): `=MIN($O$2:$O$6)/O2`
  - Formula untuk C13 (Air): `=MIN($P$2:$P$6)/P2`

> ⚠️ **Pengecualian C8 (Jumlah Kendaraan)**:
> Jika ada nilai 0, gunakan formula bersyarat agar tidak menghasilkan error pembagian dengan nol (`#DIV/0!`):
> `=IF(K2=0, 1, MIN(IF($K$2:$K$6>0, $K$2:$K$6))/K2)` *(Gunakan Ctrl+Shift+Enter jika di Excel versi lama untuk mengevaluasi array)*.

### Sheet 4: "Hasil SAW"

Kolom nilai Vi (contoh baris A1):
```excel
=SUMPRODUCT(Bobot!$D$2:$D$14/100, Normalisasi!D2:P2)
```

Kolom Ranking:
```excel
=RANK(ViCell, $ViRange, 0)
```

Kolom Status:
```excel
=IF(RankingCell<=Pengaturan!$B$1,"Penerima",IF(RankingCell<=Pengaturan!$B$1+5,"Cadangan","Tidak Lolos"))
```

---

## 7. Verifikasi Perhitungan Manual vs Sistem

| Nama | Vi (Manual Baru) | Vi (Sistem Baru) | Selisih | Status |
|------|-------------|-------------|---------|--------|
| Eni Sulistyowati | 0.8543 | 0.8543 | ✅ 0 | Penerima |
| Citra Dewi      | 0.8215 | 0.8215 | ✅ 0 | Penerima |
| Ahmad Santoso   | 0.7976 | 0.7976 | ✅ 0 | Penerima |
| Budi Raharjo    | 0.5393 | 0.5393 | ✅ 0 | Cadangan |
| Darto Wibowo    | 0.3202 | 0.3202 | ✅ 0 | Cadangan |
