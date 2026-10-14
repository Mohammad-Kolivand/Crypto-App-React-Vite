import { useEffect, useState } from "react";
import { Search as SearchIcon, X, ChevronDown } from "lucide-react";
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
      setIsLoading(false);
      return undefined;
    }
    const search = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(searchCoin(text), { signal: controller.signal });
        if (!res.ok) throw new Error("Search request failed");
        const json = await res.json();
        setCoins(Array.isArray(json.coins) ? json.coins : []);
      } catch (error) {
        if (error.name !== "AbortError") setCoins([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    const delayDebounce = setTimeout(search, 400);
    return () => { clearTimeout(delayDebounce); controller.abort(); };
  }, [text]);

  return (
    <div className={styles.searchBox}>
      <label className={styles.searchInputWrap}>
        <SearchIcon size={17} />
        <input type="text" placeholder="Search assets by name or symbol…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search crypto assets" />
        {text && <button type="button" className={styles.clearSearch} onClick={() => setText("")} aria-label="Clear search"><X size={15} /></button>}
      </label>
      <label className={styles.currencySelect}>
        <span>QUOTE</span>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Quote currency">
          <option value="usd">USD</option><option value="eur">EUR</option><option value="jpy">JPY</option>
        </select>
        <ChevronDown size={14} />
      </label>
      {(!!coins.length || isLoading) && (
        <div className={styles.searchResult}>
          {isLoading && <p className={styles.searchStatus}>Searching assets…</p>}
          <ul>{coins.map((coin) => <li key={coin.id}><img src={coin.thumb} alt="" /><p>{coin.name}</p><span>{coin.symbol?.toUpperCase()}</span></li>)}</ul>
        </div>
      )}
    </div>
  );
}
export default Search;
