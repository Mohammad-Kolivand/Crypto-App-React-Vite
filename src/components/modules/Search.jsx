import { useEffect, useState } from "react";
import { searchCoin } from "../../services/cryptoApi";

import styles from "./Search.module.css";

function Search({ currency, setCurrency }) {
  const [text, setText] = useState("");
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (!text.trim()) {
      setCoins([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(searchCoin(text), {
          signal: controller.signal,
        });
        const json = await res.json();
        console.log(json);
        if (Array.isArray(json.coins)) {
          setCoins(json.coins);
        } else {
          setCoins([]);
          alert(json.status?.error_message || "Unknown error");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          alert(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      search();
    }, 500);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [text]);

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        placeholder="Search..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="usd">USD</option>
        <option value="eur">EUR</option>
        <option value="jpy">JPY</option>
      </select>
      {!!coins.length && (
        <div className={styles.searchResult}>
          {isLoading && <p>Loading...</p>}
          <ul>
            {coins.map((coin) => (
              <li key={coin.id}>
                <img src={coin.thumb} alt={coin.name} />
                <p>{coin.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Search;
