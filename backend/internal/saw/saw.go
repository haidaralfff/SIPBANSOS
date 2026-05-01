package saw

import (
	"sort"
)

type Alternatif struct {
	ID    int
	Nama  string
	Nilai [13]float64
}

type HasilSAW struct {
	AlternatifID int     `json:"id"`
	Nama         string  `json:"nama"`
	Vi           float64 `json:"vi"`
	Ranking      int     `json:"ranking"`
	Status       string  `json:"status"`
}

func HitungSAW(alternatifs []Alternatif, bobot [13]float64, kuota int) []HasilSAW {
	m := len(alternatifs)
	if m == 0 {
		return nil
	}

	// build column max/min
	var maxv [13]float64
	var minv [13]float64
	for j := 0; j < 13; j++ {
		maxv[j] = alternatifs[0].Nilai[j]
		minv[j] = alternatifs[0].Nilai[j]
	}
	for i := 0; i < m; i++ {
		for j := 0; j < 13; j++ {
			v := alternatifs[i].Nilai[j]
			if v > maxv[j] {
				maxv[j] = v
			}
			if v < minv[j] {
				minv[j] = v
			}
		}
	}

	// normalize
	norm := make([][13]float64, m)
	for i := 0; i < m; i++ {
		for j := 0; j < 13; j++ {
			// by default treat all as benefit for this simple implementation
			if maxv[j] == 0 {
				norm[i][j] = 0
			} else {
				norm[i][j] = alternatifs[i].Nilai[j] / maxv[j]
			}
		}
	}

	hasil := make([]HasilSAW, m)
	for i := 0; i < m; i++ {
		var vi float64
		for j := 0; j < 13; j++ {
			vi += bobot[j] * norm[i][j]
		}
		hasil[i] = HasilSAW{AlternatifID: alternatifs[i].ID, Nama: alternatifs[i].Nama, Vi: vi}
	}

	sort.Slice(hasil, func(i, j int) bool { return hasil[i].Vi > hasil[j].Vi })

	for i := range hasil {
		hasil[i].Ranking = i + 1
		switch {
		case i < kuota:
			hasil[i].Status = "Penerima"
		case i < kuota+5:
			hasil[i].Status = "Cadangan"
		default:
			hasil[i].Status = "Tidak Lolos"
		}
	}

	return hasil
}
