import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Coins,
  RefreshCw,
  Star,
} from "lucide-react";
import { getCoinList } from "../../services/cryptoApi";
import TableCoin from "../modules/TableCoin";
import Pagination from "../modules/Pagination";
import Search from "../modules/Search";
import styles from "./HomePage.module.css";

const Chart = lazy(() => import("../modules/Chart"));

function HomePage() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState("usd");
  const [chart, setChart] = useState(null);
  const [marketFilter, setMarketFilter] = useState("all");
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem("cryptopulse-watchlist");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [calculatorCoinId, setCalculatorCoinId] = useState("");
  const [investment, setInvestment] = useState("1000");
  const [buyPrice, setBuyPrice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function getData() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(getCoinList(page, currency), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 429
              ? "Market API rate limit reached. Wait a moment and retry."
              : `Market data request failed (${response.status}).`
          );
        }
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected market data response.");
        if (!controller.signal.aborted) setCoins(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load market data.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    getData();
    return () => controller.abort();
  }, [page, currency]);

  useEffect(() => {
    try {
      localStorage.setItem("cryptopulse-watchlist", JSON.stringify(watchlist));
    } catch {
      // Storage can be unavailable in private browsing.
    }
  }, [watchlist]);

  const toggleWatchlist = (coinId) => {
    setWatchlist((current) =>
      current.includes(coinId)
        ? current.filter((id) => id !== coinId)
        : [...current, coinId]
    );
  };

  const { gainers, losers } = useMemo(
    () =>
      coins.reduce(
        (summary, coin) => {
          const change = Number(coin.price_change_percentage_24h);
          if (Number.isFinite(change)) {
            if (change > 0) summary.gainers += 1;
            else if (change < 0) summary.losers += 1;
          }
          return summary;
        },
        { gainers: 0, losers: 0 }
      ),
    [coins]
  );

  const filteredCoins = useMemo(() => {
    if (marketFilter === "watchlist") {
      return coins.filter((coin) => watchlist.includes(coin.id));
    }
    if (marketFilter === "gainers") {
      return coins.filter((coin) => Number(coin.price_change_percentage_24h) > 0);
    }
    if (marketFilter === "losers") {
      return coins.filter((coin) => Number(coin.price_change_percentage_24h) < 0);
    }
    return coins;
  }, [coins, marketFilter, watchlist]);

  const calculatorCoin = coins.find((coin) => coin.id === calculatorCoinId) || coins[0];
  const investmentValue = Number(investment);
  const entryPrice = Number(buyPrice);
  const currentValue =
    calculatorCoin && entryPrice > 0 && investment !== "" && investmentValue >= 0
      ? (investmentValue / entryPrice) * Number(calculatorCoin.current_price)
      : null;
  const profitLoss = currentValue === null ? null : currentValue - investmentValue;
  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className={styles.dashboard}>
      {chart && (
        <Suspense fallback={<div className={styles.chartLoading} role="status">Loading chart…</div>}>
          <Chart chart={chart} setChart={setChart} currency={currency} />
        </Suspense>
      )}

      <section
        className={styles.marketSummary}
        aria-label="Summary of assets currently loaded"
      >
        <div className={styles.summaryMetric}>
          <span className={styles.metricLabel}><Coins size={15} /> Assets on page</span>
          <strong>{isLoading ? "—" : coins.length}</strong>
        </div>
        <div className={styles.summaryMetric}>
          <span className={styles.metricLabel}><ArrowUpRight size={15} /> Rising</span>
          <strong className={styles.positiveValue}>{isLoading ? "—" : gainers}</strong>
        </div>
        <div className={styles.summaryMetric}>
          <span className={styles.metricLabel}><ArrowDownRight size={15} /> Falling</span>
          <strong className={styles.negativeValue}>{isLoading ? "—" : losers}</strong>
        </div>
      </section>

      <section className={styles.calculator} aria-label="Profit and loss calculator">
        <div className={styles.calculatorTitle}>
          <Calculator size={18} />
          <div>
            <h2>Profit / Loss Calculator</h2>
            <p>Estimate a position using the selected asset's current market price.</p>
          </div>
        </div>
        <div className={styles.calculatorFields}>
          <label>
            Asset
            <select
              value={calculatorCoin?.id ?? ""}
              onChange={(event) => setCalculatorCoinId(event.target.value)}
              disabled={!coins.length}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol?.toUpperCase()})
                </option>
              ))}
            </select>
          </label>
          <label>
            Invested amount ({currency.toUpperCase()})
            <input
              type="number"
              min="0"
              step="any"
              value={investment}
              onChange={(event) => setInvestment(event.target.value)}
              placeholder="e.g. 1000"
            />
          </label>
          <label>
            Average buy price ({currency.toUpperCase()})
            <input
              type="number"
              min="0"
              step="any"
              value={buyPrice}
              onChange={(event) => setBuyPrice(event.target.value)}
              placeholder="Enter your entry price"
            />
          </label>
        </div>
        {buyPrice !== "" && entryPrice > 0 && investment !== "" &&
        investmentValue >= 0 && currentValue !== null && Number.isFinite(currentValue) ? (
          <div className={styles.calculatorResult} aria-live="polite">
            <div>
              <span>Estimated current value</span>
              <strong>{formatMoney(currentValue)}</strong>
            </div>
            <div>
              <span>Estimated P/L</span>
              <strong className={profitLoss >= 0 ? styles.positiveValue : styles.negativeValue}>
                {profitLoss > 0 ? "+" : ""}{formatMoney(profitLoss)}
                {" "}({investmentValue > 0 ? `${((profitLoss / investmentValue) * 100).toFixed(2)}%` : "—"})
              </strong>
            </div>
          </div>
        ) : (
          <p className={styles.calculatorHint}>
            Enter your average buy price to estimate profit or loss. Fees and taxes are not included.
          </p>
        )}
      </section>

      <section id="market" className={styles.marketSection}>
        <div className={styles.marketHeading}></div>
        <div className={styles.marketToolbar}>
          <Search currency={currency} setCurrency={setCurrency} />
          <div className={styles.marketFilters} aria-label="Filter market assets">
            {[
              { value: "all", label: "All assets" },
              { value: "gainers", label: "Gainers" },
              { value: "losers", label: "Losers" },
              { value: "watchlist", label: `Watchlist (${watchlist.length})` },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={marketFilter === filter.value ? styles.activeFilter : ""}
                aria-pressed={marketFilter === filter.value}
                onClick={() => setMarketFilter(filter.value)}
              >
                {filter.value === "watchlist" && <Star size={13} />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <div className={styles.errorNotice} role="alert">
            <RefreshCw size={16} />
            <span>{loadError}</span>
          </div>
        )}

        <div className={styles.tableArea}>
          <TableCoin
            coins={filteredCoins}
            isLoading={isLoading}
            setChart={setChart}
            currency={currency}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
          />
        </div>

        <div className={styles.paginationArea}>
          <Pagination page={page} setPage={setPage} />
        </div>
        <div className={styles.marketFootnote}>
          <span>Market data</span>
          <span className={styles.footnoteDot}>·</span>
          <span>Summary and filters apply to the assets loaded on this page.</span>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
