import styles from "./Layout.module.css";

function Layout({ children }) {
  return (
    <>
      <header className={styles.header}>
        <h1>Crypto App</h1>
        <p>
          <a href="www.goolge.com">Google</a> | My best project
        </p>
      </header>
      {children}
      <footer className={styles.footer}>
        <p>Developed by Mohammadreza with ❤️ </p>
      </footer>
    </>
  );
}

export default Layout;
