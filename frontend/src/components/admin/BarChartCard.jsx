import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarChartCard = ({ title, data }) => (
  <div className="p-4 bg-white rounded-md shadow-sm">
    <h4 className="font-semibold mb-2">{title}</h4>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#34d399" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChartCard;
