import { Button } from '@mui/material';
import Link from './Link';
import styles from '../styles/Navbar.module.css';
function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Button component={Link} href="/" variant="contained" disableElevation>
        Liste de la semaine
      </Button>

      <Button
        component={Link}
        href="/daily"
        variant="contained"
        disableElevation
      >
        Recettes du jour
      </Button>
    </nav>
  );
}

export default Navbar;
