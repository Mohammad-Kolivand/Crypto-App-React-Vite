
import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  RefreshCw,
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
            `Market data request failed (${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected market data response.");
        }

        if (!controller.signal.aborted) {
          setCoins(data);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load market data."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    getData();

    return () => {
      controller.abort();
    };
  }, [page, currency]);

  const { gainers, losers } = useMemo(() => {
    return coins.reduce(
      (summary, coin) => {
        const change = Number(coin.price_change_percentage_24h);

        if (Number.isFinite(change)) {
          if (change > 0) {
            summary.gainers += 1;
          } else if (change < 0) {
            summary.losers += 1;
          }
        }

        return summary;
      },
      { gainers: 0, losers: 0 }
    );
  }, [coins]);

  return (
    <div className={styles.dashboard}>
      {chart && (
        <Suspense
          fallback={
            <div className={styles.chartLoading} role="status">
              Loading chart…
            </div>
          }
        >
          <Chart chart={chart} setChart={setChart} />
        </Suspense>
      )}

      <section id="overview" className={styles.intro}>
        <div className={styles.introCopy}></div>
        <div className={styles.snapshot}></div>
      </section>

      <section
        className={styles.marketSummary}
        aria-label="Summary of assets on this page"
      >
        <div className={styles.summaryMetric}>
          <span className={styles.metricLabel}>
            <Coins size={15} />
            Assets
          </span>

          <strong>{isLoading ? "—" : coins.length}</strong>
        </div>

        <div className={styles.summaryMetric}>
          <span className={styles.metricLabel}>
            <ArrowUpRight size={15} />
            Rising
          </span>

          <strong className={styles.positiveValue}>
            {isLoading ? "—" : gainers}
          </strong>
        </div>

        <div className={styles.summaryMetric}>
          <span className={styles.metricLabel}>
            <ArrowDownRight size={15} />
            Falling
          </span>

          <strong className={styles.negativeValue}>
            {isLoading ? "—" : losers}
          </strong>
        </div>
      </section>

      <section id="market" className={styles.marketSection}>
        <div className={styles.marketHeading}></div>

        <div className={styles.marketToolbar}>
          <Search
            currency={currency}
            setCurrency={setCurrency}
          />
        </div>

        {loadError && (
          <div className={styles.errorNotice} role="alert">
            <RefreshCw size={16} />
            <span>{loadError}</span>
          </div>
        )}

        <div className={styles.tableArea}>
          <TableCoin
            coins={coins}
            isLoading={isLoading}
            setChart={setChart}
            currency={currency}
          />
        </div>

        <div className={styles.paginationArea}>
          <Pagination page={page} setPage={setPage} />
        </div>

        <div className={styles.marketFootnote}>
          <span>Market data</span>
          <span className={styles.footnoteDot}>·</span>
          <span>
            Values reflect the assets currently displayed.
          </span>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
