import Link from 'next/link';
import styles from '../styles/Home.module.css';

function Home() {
  return (
    <div className={styles.container}>
      WIP. Welcome to A Table ! A notion integration to manage your shopping
      list on notion. To start your experience, go on{' '}
      <Link href="/embed">this page</Link>
    </div>
  );
}

export default Home;
