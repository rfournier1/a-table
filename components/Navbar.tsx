import { Button } from '@mui/material';
import Link from './Link';
import styles from '../styles/Navbar.module.css';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

type NavbarProps = {
  isLoggedIn: boolean;
};
function Navbar() {
  const { push } = useRouter();
  const onLogout = useCallback(async () => {
    await fetch('/api/logout');
    push('/login');
  }, [push]);
  return (
    <nav className={styles.navbar}>
      <div>
        <Button component={Link} href="/" variant="contained" disableElevation>
          Weekly shopping list
        </Button>

        <Button
          component={Link}
          href="/daily"
          variant="contained"
          disableElevation
        >
          Daily Reciepes
        </Button>
      </div>

      <Button onClick={onLogout} variant="contained" disableElevation>
        Log out
      </Button>
    </nav>
  );
}

export default Navbar;
