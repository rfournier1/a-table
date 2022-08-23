import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Box from '@mui/material/Box';
import { ShoppingList } from '../types';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
import styleVariables from '../styles/variables.module.css';
function Home() {
  const [shoppingList, setShoppingList] = useState<ShoppingList>([]);
  const [loading, setLoading] = useState(true);
  const [firstDate, setFirstDate] = useState<Date | null>();
  const [lastDate, setLastDate] = useState<Date | null>();
  const [error, setError] = useState(false);

  dayjs.locale('fr');

  useEffect(() => {
    let lastMonday = new Date();
    lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() % 7) + 1);
    let nextMonday = new Date();
    nextMonday.setDate(lastMonday.getDate() + 6);
    setFirstDate(lastMonday);
    setLastDate(nextMonday);
  }, []);
  useEffect(() => {
    if (!firstDate || !lastDate) {
      return;
    }
    setLoading(true);
    setError(false);
    fetch(
      `/api/list?firstDate=${firstDate.toISOString().split('T')[0]}&lastDate=${
        lastDate.toISOString().split('T')[0]
      }`
    )
      .then((res) => res.json())
      .then((data: ShoppingList) => {
        setShoppingList(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [firstDate, lastDate]);
  return (
    <div className={styles.container}>
      <Head>
        <title>À table !</title>
        <meta
          name="description"
          content="Generating a shopping from our collocation's notion"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Notre liste de courses</h1>
        <div className={styles.content}>
          <div className={styles.datePickers}>
            <div className={styles.datePicker}>
              <Box sx={{ mr: 2 }}> du </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={firstDate}
                  onChange={(newValue) => {
                    setFirstDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
            <div className={styles.datePicker}>
              <Box sx={{ mx: 2 }}> au </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={lastDate}
                  onChange={(newValue) => {
                    setLastDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className={styles.list}>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <div>
                Something went wrong, your request is probably too heavy for the
                server
              </div>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ maxWidth: '100%' }} aria-label="shopping list">
                  <TableHead sx={{ background: styleVariables.secondary }}>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Unité</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shoppingList.map((shoppingListItem, index) => (
                      <TableRow
                        key={shoppingListItem.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          background:
                            index % 2 === 1
                              ? 'transparent'
                              : `${styleVariables.secondaryLight}4c`,
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {shoppingListItem.name}
                        </TableCell>
                        <TableCell align="right">
                          {shoppingListItem.quantity}
                        </TableCell>
                        <TableCell align="right">
                          {shoppingListItem.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
