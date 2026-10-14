import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

function Pagination({ page, setPage }) {
  const previousHandler = () => { if (page > 1) setPage((current) => current - 1); };
  const nextHandler = () => { if (page < 10) setPage((current) => current + 1); };
  return (
    <nav className={styles.pagination} aria-label="Market pages">
      <button type="button" onClick={previousHandler} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft size={16} /><span>Previous</span>
      </button>
      <p className={page === 1 ? styles.selected : ""} aria-current={page === 1 ? "page" : undefined}>1</p>
      <p className={page === 2 ? styles.selected : ""} aria-current={page === 2 ? "page" : undefined}>2</p>
      {page > 2 && page < 9 && <><span className={styles.ellipsis}>…</span><p className={styles.selected} aria-current="page">{page}</p></>}
      <span className={styles.ellipsis}>…</span>
      <p className={page === 9 ? styles.selected : ""} aria-current={page === 9 ? "page" : undefined}>9</p>
      <p className={page === 10 ? styles.selected : ""} aria-current={page === 10 ? "page" : undefined}>10</p>
      <button type="button" onClick={nextHandler} disabled={page === 10} aria-label="Next page">
        <span>Next</span><ChevronRight size={16} />
      </button>
    </nav>
  );
}
export default Pagination;
