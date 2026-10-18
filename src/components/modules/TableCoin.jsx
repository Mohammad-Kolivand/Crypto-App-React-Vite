import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Star,
} from "lucide-react";
import styles from "./TableCoin.module.css";

function formatPrice(price, currency) {
  if (price == null || !Number.isFinite(Number(price))) return "N/A";
  const value = Number(price);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: value >= 1 ? 2 : 8,
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value.toLocaleString("en-US")}`;
  }
}

function TableCoin({
  coins = [],
  isLoading,
  setChart,
  currency = "usd",
  watchlist = [],
  toggleWatchlist = () => {},
}) {
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
            {coins.map((coin) => (
              <TableRow
                key={coin.id}
                coin={coin}
                setChart={setChart}
                currency={currency}
                isWatchlisted={watchlist.includes(coin.id)}
                toggleWatchlist={toggleWatchlist}
              />
            ))}
            {!coins.length && (
              <tr>
                <td colSpan="6" className={styles.empty}>
                  No assets match this filter on the current page.
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

function TableRow({ coin, setChart, currency, isWatchlisted, toggleWatchlist }) {
  const {
    id,
    name,
    image,
    symbol,
    total_volume,
    current_price,
    price_change_percentage_24h: priceChange,
  } = coin;

  return (
    <tr>
      <td>
        <div className={styles.assetActions}>
          <button
            type="button"
            className={styles.assetButton}
            onClick={() => setChart({ coin })}
            aria-label={`Open price chart for ${name}`}
          >
            <img src={image ?? "default-image.png"} alt="" />
            <span className={styles.assetSymbol}>{symbol?.toUpperCase() ?? "N/A"}</span>
            <BarChart3 size={14} className={styles.assetChartIcon} />
          </button>
          <button
            type="button"
            className={`${styles.watchlistButton} ${isWatchlisted ? styles.watchlisted : ""}`}
            onClick={() => toggleWatchlist(id)}
            aria-label={`${isWatchlisted ? "Remove" : "Add"} ${name} ${isWatchlisted ? "from" : "to"} watchlist`}
            aria-pressed={isWatchlisted}
            title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star size={15} fill={isWatchlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </td>
      <td className={styles.assetName}>{name ?? "N/A"}</td>
      <td className={styles.numeric}>{formatPrice(current_price, currency)}</td>
      <td className={priceChange > 0 ? styles.success : priceChange < 0 ? styles.error : styles.neutral}>
        <span className={styles.changeValue}>
          {priceChange > 0 ? <ArrowUpRight size={14} /> : priceChange < 0 ? <ArrowDownRight size={14} /> : null}
          {priceChange == null ? "N/A" : `${priceChange > 0 ? "+" : ""}${Number(priceChange).toFixed(2)}%`}
        </span>
      </td>
      <td className={styles.numeric}>{total_volume?.toLocaleString() ?? "N/A"}</td>
      <td>
        <span
          className={priceChange > 0 ? styles.trendUp : priceChange < 0 ? styles.trendDown : styles.trendNeutral}
          aria-label={priceChange > 0 ? "Upward trend" : priceChange < 0 ? "Downward trend" : "No change"}
        >
          {priceChange > 0 ? <ArrowUpRight size={17} /> : priceChange < 0 ? <ArrowDownRight size={17} /> : "—"}
        </span>
      </td>
    </tr>
  );
}
