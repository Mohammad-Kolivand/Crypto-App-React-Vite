import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Coins, RefreshCw } from "lucide-react";
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
      {!!chart && (
        <Suspense fallback={<div className={styles.chartLoading} role="status">Loading chart…</div>}>
          <Chart setChart={setChart} chart={chart} />
        </Suspense>
      )}

      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>MARKET OVERVIEW <span>/</span> {currency.toUpperCase()}</p>
          <h1>Crypto market</h1>
        </div>
        <div className={styles.marketMeta}>
          <span className={styles.statusDot} />
          <span>{isLoading ? "Updating" : "Market snapshot"}</span>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="Current market summary">
        <article className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon}><Coins size={17} /></span>
            <span className={styles.statLabel}>Assets</span>
          </div>
          <strong>{isLoading ? "—" : coins.length}</strong>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon + " " + styles.positiveIcon}><ArrowUpRight size={18} /></span>
            <span className={styles.statLabel}>Up 24h</span>
          </div>
          <strong>{isLoading ? "—" : gainers}</strong>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon + " " + styles.negativeIcon}><ArrowDownRight size={18} /></span>
            <span className={styles.statLabel}>Down 24h</span>
          </div>
          <strong>{isLoading ? "—" : losers}</strong>
        </article>
      </section>

      <section className={styles.marketSection}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Market</h2>
            <span className={styles.sectionSubheading}>Price and 24h change</span>
          </div>
          <span className={styles.pageIndicator}>{page}<span>/ 10</span></span>
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
