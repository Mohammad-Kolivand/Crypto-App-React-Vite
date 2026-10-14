import { useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Coins, RefreshCw, Wallet } from "lucide-react";
import { getCoinList } from "../../services/cryptoApi";
import TableCoin from "../modules/TableCoin";
import Pagination from "../modules/Pagination";
import Search from "../modules/Search";
import Chart from "../modules/Chart";
import styles from "./HomePage.module.css";

function HomePage() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState("usd");
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const getData = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await fetch(getCoinList(page, currency), { signal: controller.signal });
        if (!res.ok) throw new Error(`Market data request failed (${res.status})`);
        const json = await res.json();
        if (!Array.isArray(json)) throw new Error("Unexpected market data response.");
        setCoins(json);
      } catch (error) {
        if (error.name !== "AbortError") setLoadError(error.message || "Unable to load market data.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    getData();
    return () => controller.abort();
  }, [page, currency]);

  const gainers = coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) > 0).length;
  const losers = coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) < 0).length;

  return (
    <div className={styles.dashboard}>
      {!!chart && <Chart setChart={setChart} chart={chart} />}
      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}><Activity size={14} /> MARKET TERMINAL / OVERVIEW</p>
          <h1>Market moves.<br /><span>Made readable.</span></h1>
          <p className={styles.introText}>A focused view of crypto prices, daily momentum, and market activity.</p>
        </div>
        <div className={styles.liveBadge}><span /> Live market watch</div>
      </section>

      <section className={styles.statsGrid} aria-label="Current page statistics">
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon}><Coins size={17} /></span><span className={styles.statLabel}>Assets loaded</span></div>
          <strong>{isLoading ? "—" : coins.length}</strong><span className={styles.statHint}>Assets on current page</span>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon + " " + styles.positiveIcon}><ArrowUpRight size={18} /></span><span className={styles.statLabel}>Daily gainers</span></div>
          <strong>{isLoading ? "—" : gainers}</strong><span className={styles.statHint}>Positive 24h movement</span>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon + " " + styles.negativeIcon}><ArrowDownRight size={18} /></span><span className={styles.statLabel}>Daily decliners</span></div>
          <strong>{isLoading ? "—" : losers}</strong><span className={styles.statHint}>Negative 24h movement</span>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon}><Wallet size={17} /></span><span className={styles.statLabel}>Quote currency</span></div>
          <strong className={styles.currencyValue}>{currency.toUpperCase()}</strong><span className={styles.statHint}>Selected market currency</span>
        </article>
      </section>

      <section className={styles.marketSection}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>MARKET SCREENER</p><h2>Top cryptocurrencies</h2></div>
          <span className={styles.pageIndicator}><span>PAGE</span> {page} <span>/ 10</span></span>
        </div>
        <Search currency={currency} setCurrency={setCurrency} />
        {loadError && <div className={styles.errorNotice} role="alert"><RefreshCw size={16} /> {loadError}</div>}
        <TableCoin coins={coins} isLoading={isLoading} setChart={setChart} />
        <Pagination page={page} setPage={setPage} />
      </section>
    </div>
  );
}
export default HomePage;
