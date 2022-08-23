import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { getShoppingListFromMeals } from '../api/notion/getShoppingListFromMeals';
import styles from '../styles/Home.module.css';
import type { InferGetStaticPropsType } from 'next';
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

function Home() {
  const [shoppingList, setShoppingList] = useState<ShoppingList>([]);
  const [loading, setLoading] = useState(true);
  const [firstDate, setFirstDate] = useState<Date | null>();
  const [lastDate, setLastDate] = useState<Date | null>();

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
    fetch(
      `/api/list?firstDate=${firstDate.toISOString().split('T')[0]}&lastDate=${
        lastDate.toISOString().split('T')[0]
      }`
    )
      .then((res) => res.json())
      .then((data: ShoppingList) => {
        setShoppingList(data);
        setLoading(false);
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
        <div className={styles.datePickers}>
          <div className={styles.datePicker}>
            <Box sx={{ mx: 2 }}> du </Box>

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

        <div className={styles.description}>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ maxWidth: '100%' }} aria-label="shopping list">
                <TableHead>
                  <TableRow>
                    <TableCell>Ingredient</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Unité</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shoppingList.map((shoppingListItem) => (
                    <TableRow
                      key={shoppingListItem.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export default Home;
