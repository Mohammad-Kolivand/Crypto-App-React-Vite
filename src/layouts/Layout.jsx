import { useEffect, useState } from "react";
import { Activity, Moon, Sun } from "lucide-react";
import styles from "./Layout.module.css";

function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("crypto-app-theme") || "dark"; }
    catch { return "dark"; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("crypto-app-theme", theme); }
    catch { /* Theme switching remains available if storage is disabled. */ }
  }, [theme]);
  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="CryptoPulse home">
          <span className={styles.brandMark}><Activity size={21} strokeWidth={2.4} /></span>
          <span>Crypto<span className={styles.brandAccent}>Pulse</span></span>
        </a>
        <p className={styles.tagline}>Market intelligence at a glance</p>
        <button type="button" className={styles.themeToggle} onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span className={styles.footerDot} />
        <p>Built with care by Mohammadreza</p>
        <span className={styles.footerNote}>Market data powered by CoinGecko</span>
      </footer>
    </div>
  );
}
export default Layout;
