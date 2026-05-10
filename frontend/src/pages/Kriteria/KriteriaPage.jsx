import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useApi } from "../../hooks/useApi";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";

const typeVariant = (type) => (type?.toLowerCase() === "benefit" ? "success" : "danger");

const KriteriaPage = () => {
  const { getKriteria, updateKriteria, createKriteria } = useApi();
  const [criteria, setCriteria] = useState([]);
  const [versionData, setVersionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editWeights, setEditWeights] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchKriteria = async () => {
      setIsLoading(true);
      const res = await getKriteria();
      if (res.success) {
        setCriteria(res.data);
        setVersionData(res.version);
        const weights = {};
        res.data.forEach((item, idx) => {
          weights[`C${idx + 1}`] = Math.round(item.weight * 100);
        });
        setEditWeights(weights);
      }
      setIsLoading(false);
    };
    fetchKriteria();
  }, [getKriteria]);

  const totalWeight = isEditing 
    ? Object.values(editWeights).reduce((sum, w) => sum + (Number(w) || 0), 0)
    : Math.round(criteria.reduce((sum, item) => sum + (item.weight || 0), 0) * 100);

  const handleWeightChange = (code, val) => {
    setEditWeights(prev => ({ ...prev, [code]: val }));
  };

  const handleSave = async () => {
    if (totalWeight !== 100) {
      toast.error("Total bobot harus tepat 100%.");
      return;
    }

    setIsSaving(true);
    const payload = {
      versi: versionData?.versi || "v1.0",
      bobot_c1: (Number(editWeights["C1"]) || 0) / 100,
      bobot_c2: (Number(editWeights["C2"]) || 0) / 100,
      bobot_c3: (Number(editWeights["C3"]) || 0) / 100,
      bobot_c4: (Number(editWeights["C4"]) || 0) / 100,
      bobot_c5: (Number(editWeights["C5"]) || 0) / 100,
      bobot_c6: (Number(editWeights["C6"]) || 0) / 100,
      bobot_c7: (Number(editWeights["C7"]) || 0) / 100,
      bobot_c8: (Number(editWeights["C8"]) || 0) / 100,
      bobot_c9: (Number(editWeights["C9"]) || 0) / 100,
      bobot_c10: (Number(editWeights["C10"]) || 0) / 100,
      bobot_c11: (Number(editWeights["C11"]) || 0) / 100,
      bobot_c12: (Number(editWeights["C12"]) || 0) / 100,
      bobot_c13: (Number(editWeights["C13"]) || 0) / 100,
    };

    let res;
    if (versionData?.id) {
      res = await updateKriteria(versionData.id, payload);
    } else {
      res = await createKriteria(payload);
    }
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
      toast.success("Bobot kriteria berhasil disimpan!");
      const refresh = await getKriteria();
      if (refresh.success) {
        setCriteria(refresh.data);
      }
    } else {
      toast.error(res.message || "Gagal menyimpan perubahan.");
    }
  };

  return (
    <AppShell title="Kriteria & Bobot" subtitle="Atur bobot 13 kriteria dan versi per periode." showRightPanel={false}>
      <div className="grid gap-4 lg:grid-cols-[2.5fr_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Daftar Kriteria Aktif</h3>
              <p className="text-xs text-text-secondary">Versi bobot saat ini</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-text-secondary">
                <tr>
                  <th className="py-2 font-semibold">Kode</th>
                  <th className="py-2 font-semibold">Nama</th>
                  <th className="py-2 font-semibold">Tipe</th>
                  <th className="py-2 font-semibold">Bobot (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-text-secondary">
                      Memuat kriteria...
                    </td>
                  </tr>
                ) : (
                  criteria.map((item) => (
                    <tr key={item.code}>
                      <td className="py-3 font-semibold text-text-primary">{item.code}</td>
                      <td className="py-3 text-text-secondary">{item.name}</td>
                      <td className="py-3">
                        <Badge variant={typeVariant(item.type)}>{item.type}</Badge>
                      </td>
                      <td className="py-3 font-semibold text-text-primary">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              className="w-16 rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary-orange"
                              value={editWeights[item.code] || ""}
                              onChange={(e) => handleWeightChange(item.code, e.target.value)}
                            />
                            <span className="text-xs text-text-secondary">%</span>
                          </div>
                        ) : (
                          `${(item.weight * 100).toFixed(0)}%`
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-text-secondary">
            <span>Menampilkan {criteria.length} kriteria</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold">Total Bobot</h3>
            <p className="text-xs text-text-secondary">Harus sama dengan 100%</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-3xl font-bold text-text-primary">{totalWeight}%</p>
              <Badge variant={totalWeight === 100 ? "success" : "warning"}>
                {totalWeight === 100 ? "Valid" : "Perlu penyesuaian"}
              </Badge>
            </div>
            <ProgressBar value={totalWeight} className="mt-3" />
          </Card>

          <Card className="p-4">
            <div className="mt-4 flex flex-col gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving || totalWeight !== 100}>
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Batal
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Ubah Bobot</Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default KriteriaPage;
