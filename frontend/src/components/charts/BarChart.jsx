import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const BarChartWidget = ({ data }) => {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={24} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(255, 155, 80, 0.08)" }}
            contentStyle={{ borderRadius: 12, borderColor: "#F3F4F6" }}
          />
          <Bar dataKey="value" fill="#FFB26B" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartWidget;
