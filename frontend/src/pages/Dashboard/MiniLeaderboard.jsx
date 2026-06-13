import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { useApi } from "../../hooks/useApi";



const getInitials = (name) => {
  const parts = name.split(" ");
  return parts.slice(0, 2).map((item) => item[0]).join("");
};

const statusLabel = (status) => {
  if (status === "penerima") return "Penerima";
  if (status === "cadangan") return "Cadangan";
  return "Tidak Lolos";
};

const MiniLeaderboard = ({ periodId }) => {
  const { getRanking } = useApi();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    const fetchRanking = async () => {
      setIsLoading(true);
      const res = await getRanking(periodId);
      if (res.success && res.data) {
        const mapped = res.data.slice(0, 5).map((item) => {
          const rt = item.rt || "";
          const rw = item.rw || "";
          const rtRw = rt && rw ? `${rt}/${rw}` : rt || rw || "-";
          let st = item.status?.toLowerCase() || "";
          if (st.includes("tidak")) st = "tidak-lolos";
          return {
            id: item.warga_id,
            name: item.nama_lengkap,
            nik: item.nik,
            rtRw,
            score: item.nilai_vi,
            status: st
          };
        });
        setLeaderboard(mapped);
      }
      setIsLoading(false);
    };
    fetchRanking();
  }, [periodId, getRanking]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Leaderboard</h3>
          <p className="text-xs text-text-secondary">Top 5 penerima berdasarkan nilai preferensi</p>
        </div>
        <button type="button" className="text-xs font-semibold text-primary-orange">
          Lihat detail
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-text-secondary">
            <tr>
              <th className="py-2 font-semibold">Rank</th>
              <th className="py-2 font-semibold">Warga</th>
              <th className="py-2 font-semibold">RT/RW</th>
              <th className="py-2 font-semibold">Skor</th>
              <th className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-text-secondary">
                  Memuat data...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-text-secondary">
                  Belum ada data ranking.
                </td>
              </tr>
            ) : (
              leaderboard.map((item, index) => (
                <tr key={item.id} className="text-sm">
                  <td className="py-3 font-semibold text-text-primary">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-orange/15 text-xs font-bold text-primary-orange">
                        {getInitials(item.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-secondary">{item.nik}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-text-secondary">{item.rtRw}</td>
                  <td className="py-3 font-semibold text-text-primary">{(item.score || 0).toFixed(3)}</td>
                  <td className="py-3">
                    <Badge variant={item.status}>{statusLabel(item.status)}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MiniLeaderboard;
