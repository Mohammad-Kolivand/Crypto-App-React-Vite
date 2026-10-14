import { useState } from "react";
import { X } from "lucide-react";
import styles from "./Chart.module.css";
import { convertData } from "../../helpers/convertData";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function Chart({ chart, setChart }) {
  const [type, setType] = useState("prices");
  const chartTypes = [
    { value: "prices", label: "Prices" },
    { value: "market_caps", label: "Market Caps" },
    { value: "total_volumes", label: "Total Volumes" },
  ];

  return (
    <div className={styles.container} role="dialog" aria-modal="true" aria-label={`${chart.coin.name} price chart`}>
      <button type="button" className={styles.cross} onClick={() => setChart(null)} aria-label="Close chart"><X size={19} /></button>
      <div className={styles.chart}>
        <div className={styles.name}><img src={chart.coin.image} alt="" /><div><p>{chart.coin.name}</p><span>MARKET HISTORY</span></div></div>
        <div className={styles.graph}><ChartComponent data={convertData(chart, type)} type={type} /></div>
        <div className={styles.types} aria-label="Chart data type">
          {chartTypes.map((item) => (
            <button
              key={item.value}
              type="button"
              className={type === item.value ? styles.selected : ""}
              aria-pressed={type === item.value}
              onClick={() => setType(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.detailes}>
          <div><p>Price</p><span>${chart.coin.current_price?.toLocaleString() ?? "N/A"}</span></div>
          <div><p>All-time high</p><span>${chart.coin.ath?.toLocaleString() ?? "N/A"}</span></div>
          <div><p>Market cap</p><span>{chart.coin.market_cap?.toLocaleString() ?? "N/A"}</span></div>
        </div>
      </div>
    </div>
  );
}
export default Chart;

const ChartComponent = ({ data, type }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <Line type="natural" dataKey={type} stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      <CartesianGrid stroke="var(--border)" strokeDasharray="4 5" />
      <YAxis dataKey={type} domain={["auto", "auto"]} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
      <XAxis dataKey="date" hide />
      <Legend />
      <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
    </LineChart>
  </ResponsiveContainer>
);
