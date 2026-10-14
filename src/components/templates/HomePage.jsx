import { useEffect, useState } from "react";
import { getCoinList } from "../../services/cryptoApi";
import TableCoin from "../modules/TableCoin";
import Pagination from "../modules/Pagination";
import Search from "../modules/Search";
import Chart from "../modules/Chart";
import styles from "./HomePage.module.css";

function HomePage() {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState("usd");
  const [chart, setChart] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const getData = async () => {
      try {
        const res = await fetch(getCoinList(page, currency));
        const json = await res.json();
        setCoins(json);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, [page, currency]);

  const gainers = coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) > 0).length;
  const losers = coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) < 0).length;

  return (
    <div className={styles.dashboard}>
      {!!chart && <Chart setChart={setChart} chart={chart} />}
      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>MARKET OVERVIEW</p>
          <h1>Your crypto market, at a glance.</h1>
          <p className={styles.introText}>Follow prices, compare daily moves, and explore the assets that matter to you.</p>
        </div>
        <div className={styles.liveBadge}><span /> Market watch</div>
      </section>

      <section className={styles.statsGrid} aria-label="Current page statistics">
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon}>◈</span><span className={styles.statLabel}>Assets loaded</span></div>
          <strong>{isLoading ? "—" : coins.length}</strong><span className={styles.statHint}>On this page</span>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon + " " + styles.positiveIcon}>↗</span><span className={styles.statLabel}>Daily gainers</span></div>
          <strong>{isLoading ? "—" : gainers}</strong><span className={styles.statHint}>Positive 24h change</span>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon + " " + styles.negativeIcon}>↘</span><span className={styles.statLabel}>Daily decliners</span></div>
          <strong>{isLoading ? "—" : losers}</strong><span className={styles.statHint}>Negative 24h change</span>
        </article>
        <article className={styles.statCard}>
          <div className={styles.statTop}><span className={styles.statIcon}>◎</span><span className={styles.statLabel}>Display currency</span></div>
          <strong className={styles.currencyValue}>{currency.toUpperCase()}</strong><span className={styles.statHint}>Change using the selector</span>
        </article>
      </section>

      <section className={styles.marketSection}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>MARKET DATA</p><h2>Top cryptocurrencies</h2></div>
          <span className={styles.pageIndicator}>Page {page} of 10</span>
        </div>
        <Search currency={currency} setCurrency={setCurrency} />
        <TableCoin coins={coins} isLoading={isLoading} setChart={setChart} />
        <Pagination page={page} setPage={setPage} />
      </section>
    </div>
  );
}
export default HomePage;
