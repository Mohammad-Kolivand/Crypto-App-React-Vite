import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import styles from "./Chart.module.css";
import { convertData } from "../../helpers/convertData";
import { marketChart } from "../../services/cryptoApi";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const timeframes = [
  { days: 1, label: "24H" },
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
];

function Chart({ chart, setChart, currency = "usd" }) {
  const [type, setType] = useState("prices");
  const [days, setDays] = useState(7);
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const chartTypes = [
    { value: "prices", label: "Price" },
    { value: "market_caps", label: "Market cap" },
    { value: "total_volumes", label: "Volume" },
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(marketChart(chart.coin.id, days, currency), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 429
              ? "API rate limit reached. Please wait a moment and retry."
              : `Chart request failed (${response.status}).`
          );
        }
        const result = await response.json();
        if (!Array.isArray(result.prices)) {
          throw new Error("The API returned invalid chart data.");
        }
        if (!controller.signal.aborted) setHistory(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load chart history.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadHistory();
    return () => controller.abort();
  }, [chart.coin.id, days, currency, retryCount]);

  const data = history?.[type] ? convertData(history, type) : [];
  const formatValue = (value) => {
    if (type === "prices") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: Number(value) < 1 ? 6 : 2,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={styles.container} role="dialog" aria-modal="true" aria-label={`${chart.coin.name} market chart`}>
      <button type="button" className={styles.cross} onClick={() => setChart(null)} aria-label="Close chart">
        <X size={19} />
      </button>
      <div className={styles.chart}>
        <div className={styles.name}>
          <img src={chart.coin.image ?? ""} alt="" />
          <div>
            <p>{chart.coin.name}</p>
            <span>MARKET HISTORY · {currency.toUpperCase()}</span>
          </div>
        </div>

        <div className={styles.timeframes} aria-label="Chart time range">
          {timeframes.map((item) => (
            <button
              key={item.days}
              type="button"
              className={days === item.days ? styles.timeframeSelected : ""}
              aria-pressed={days === item.days}
              onClick={() => setDays(item.days)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.graph}>
          {isLoading ? (
            <div className={styles.chartStatus} role="status">
              <span className={styles.chartSpinner} />
              Loading {days === 1 ? "24-hour" : `${days}-day`} history…
            </div>
          ) : error ? (
            <div className={styles.chartError} role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : data.length ? (
            <ChartComponent data={data} type={type} formatValue={formatValue} />
          ) : (
            <div className={styles.chartStatus}>No chart data available for this range.</div>
          )}
        </div>

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
          <div>
            <p>Price</p>
            <span>{chart.coin.current_price == null ? "N/A" : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency.toUpperCase(),
              maximumFractionDigits: chart.coin.current_price < 1 ? 6 : 2,
            }).format(chart.coin.current_price)}</span>
          </div>
          <div>
            <p>All-time high</p>
            <span>{chart.coin.ath == null ? "N/A" : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency.toUpperCase(),
              maximumFractionDigits: 2,
            }).format(chart.coin.ath)}</span>
          </div>
          <div>
            <p>Market cap</p>
            <span>{chart.coin.market_cap?.toLocaleString() ?? "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartComponent({ data, type, formatValue }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="natural" dataKey={type} stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 5" />
        <YAxis
          dataKey={type}
          domain={["auto", "auto"]}
          tickFormatter={formatValue}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={76}
        />
        <XAxis dataKey="date" hide />
        <Legend />
        <Tooltip
          formatter={(value) => formatValue(value)}
          labelFormatter={(value) => new Date(value).toLocaleString()}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Chart;
