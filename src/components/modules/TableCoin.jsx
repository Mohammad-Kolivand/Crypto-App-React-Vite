import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import styles from "./TableCoin.module.css";
import { marketChart } from "../../services/cryptoApi";

function formatPrice(price, currency) {
  if (price == null || !Number.isFinite(Number(price))) {
    return "N/A";
  }

  const value = Number(price);
  const fractionDigits = value >= 1 ? 2 : 8;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value.toLocaleString("en-US")}`;
  }
}

function TableCoin({ coins = [], isLoading, setChart, currency = "usd" }) {
  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loading} role="status">
          <span className={styles.loader} />
          Loading market data…
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Name</th>
              <th>Last price</th>
              <th>24h change</th>
              <th>24h volume</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(coins) &&
              coins.map((coin) => (
                <TableRow
                  coin={coin}
                  key={coin?.id}
                  setChart={setChart}
                  currency={currency}
                />
              ))}
            {!coins.length && (
              <tr>
                <td colSpan="6" className={styles.empty}>
                  No market assets to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TableCoin;

const TableRow = ({ coin, setChart, currency }) => {
  const {
    id,
    name,
    image,
    symbol,
    total_volume,
    current_price,
    price_change_percentage_24h: price_change,
  } = coin;

  const showHandler = async () => {
    try {
      const res = await fetch(marketChart(id));
      if (!res.ok) throw new Error("Chart request failed");
      const json = await res.json();
      setChart({ ...json, coin });
    } catch {
      setChart(null);
    }
  };

  return (
    <tr>
      <td>
        <button
          type="button"
          className={styles.assetButton}
          onClick={showHandler}
          aria-label={`Open price chart for ${name}`}
        >
          <img src={image ?? "default-image.png"} alt="" />
          <span className={styles.assetSymbol}>
            {symbol?.toUpperCase() ?? "N/A"}
          </span>
          <BarChart3 size={14} className={styles.assetChartIcon} />
        </button>
      </td>
      <td className={styles.assetName}>{name ?? "N/A"}</td>
      <td className={styles.numeric}>
        {formatPrice(current_price, currency)}
      </td>
      <td
        className={
          price_change > 0
            ? styles.success
            : price_change < 0
              ? styles.error
              : styles.neutral
        }
      >
        <span className={styles.changeValue}>
          {price_change > 0 ? (
            <ArrowUpRight size={14} />
          ) : price_change < 0 ? (
            <ArrowDownRight size={14} />
          ) : null}
          {price_change == null
            ? "N/A"
            : `${price_change > 0 ? "+" : ""}${price_change.toFixed(2)}%`}
        </span>
      </td>
      <td className={styles.numeric}>
        {total_volume?.toLocaleString() ?? "N/A"}
      </td>
      <td>
        <span
          className={
            price_change > 0 ? styles.trendUp : styles.trendDown
          }
          aria-label={price_change > 0 ? "Upward trend" : "Downward trend"}
        >
          {price_change > 0 ? (
            <ArrowUpRight size={17} />
          ) : (
            <ArrowDownRight size={17} />
          )}
        </span>
      </td>
    </tr>
  );
};
