import ChartUp from "../../assets/chart-up.svg";
import ChartDown from "../../assets/chart-down.svg";

import styles from "./TableCoin.module.css";

import { marketChart } from "../../services/cryptoApi";

function TableCoin({ coins = [], isLoading, setChart }) {
  return (
    <div className={styles.container}>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Name</th>
              <th>Price</th>
              <th>24h</th>
              <th>Total Volume</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(coins)
              ? coins.map((coin) => (
                  <TableRow coin={coin} key={coin?.id} setChart={setChart} />
                ))
              : null}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TableCoin;

const TableRow = ({ coin, setChart }) => {
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
      const json = await res.json();
      setChart({ ...json, coin });
    } catch (error) {
      setChart(null);
    }
  };

  return (
    <tr>
      <td>
        <div className={styles.symbol} onClick={showHandler}>
          <img src={image ?? "default-image.png"} alt={name ?? "Unknown"} />
          <span>{symbol?.toUpperCase() ?? "N/A"}</span>
        </div>
      </td>
      <td>{name ?? "N/A"}</td>
      <td>${current_price?.toLocaleString() ?? "N/A"}</td>
      <td
        className={
          price_change ? (price_change > 0 ? styles.success : styles.error) : ""
        }
      >
        %{price_change?.toFixed(2) ?? "N/A"}
      </td>
      <td>{total_volume?.toLocaleString() ?? "N/A"}</td>
      <td>
        <img
          src={price_change > 0 ? ChartUp : ChartDown}
          alt={name ?? "Unknown"}
        />
      </td>
    </tr>
  );
};
