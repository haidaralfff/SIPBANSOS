import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#FF9B50", "#38BDF8", "#E5E7EB"];

const DonutChartWidget = ({ data }) => {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={50} outerRadius={70} stroke="none" paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#F3F4F6" }}
            formatter={(value, name) => [`${value} warga`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChartWidget;
