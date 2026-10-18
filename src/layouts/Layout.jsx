import { useEffect, useState } from "react";
import {  Moon, Sun } from "lucide-react";
import styles from "./Layout.module.css";

function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("crypto-app-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("crypto-app-theme", theme);
    } catch {
      // Theme switching remains available if storage is disabled.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="CryptoPulse home">

          <span>
            Crypto<span className={styles.brandAccent}>App</span>
          </span>

        </a>

        <div className={styles.headerRight}>


          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <span className={styles.footerDot} />
        <span>CryptoPulse</span>
        <span className={styles.footerDivider}>/</span>
        <span>Market data powered by CoinGecko</span>
        <span className={styles.footerAuthor}>Built by Mohammadreza</span>
      </footer>
    </div>
  );
}

export default Layout;
