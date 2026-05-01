import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const LEADERBOARD = [
  { name: "Jerome Bell", nik: "3275030102XXXX", rtRw: "02/04", score: 0.892, status: "penerima" },
  { name: "Courtney Henry", nik: "3275030103XXXX", rtRw: "01/03", score: 0.876, status: "penerima" },
  { name: "Arlene McCoy", nik: "3275030104XXXX", rtRw: "05/07", score: 0.861, status: "penerima" },
  { name: "Darrell Steward", nik: "3275030105XXXX", rtRw: "03/02", score: 0.842, status: "cadangan" },
  { name: "Bessie Cooper", nik: "3275030106XXXX", rtRw: "02/01", score: 0.829, status: "tidak-lolos" }
];

const getInitials = (name) => {
  const parts = name.split(" ");
  return parts.slice(0, 2).map((item) => item[0]).join("");
};

const statusLabel = (status) => {
  if (status === "penerima") return "Penerima";
  if (status === "cadangan") return "Cadangan";
  return "Tidak Lolos";
};

const MiniLeaderboard = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Leaderboard SAW</h3>
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
            {LEADERBOARD.map((item, index) => (
              <tr key={item.nik} className="text-sm">
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
                <td className="py-3 font-semibold text-text-primary">{item.score.toFixed(3)}</td>
                <td className="py-3">
                  <Badge variant={item.status}>{statusLabel(item.status)}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MiniLeaderboard;
