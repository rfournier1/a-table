import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Box from '@mui/material/Box';
import { ShoppingList, ShoppingListItem } from '../types';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
import styleVariables from '../styles/variables.module.css';
import { mutateIngredientCheckedProperty } from '../api/notion/mutateIngredientCheckedProperty';

type Sort = {
  criteria: 'name' | 'area' | 'checked';
  direction: 'asc' | 'desc';
};

function Home() {
  const [shoppingList, setShoppingList] = useState<ShoppingList>([]);
  const [loading, setLoading] = useState(true);
  const [firstDate, setFirstDate] = useState<Date | null>(null);
  const [lastDate, setLastDate] = useState<Date | null>(null);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<Sort>({
    criteria: 'area',
    direction: 'desc',
  });
  const [forceUpdate, setForceUpdate] = useState(false); //invert it to force list fetching

  dayjs.locale('fr');

  const handleSortClick = useCallback(
    (criteria: Sort['criteria']) => {
      if (criteria === sort.criteria) {
        setSort((prev) => ({
          ...prev,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }));
      } else {
        setSort({ criteria, direction: 'desc' });
      }
    },
    [sort]
  );

  const handleCheckedClick = useCallback(
    async (id: string, checked: boolean) => {
      const itemToUpdate = shoppingList.find((item) => item.id === id);
      if (itemToUpdate) {
        itemToUpdate.checkedLoading = true;
        setShoppingList([...shoppingList]);
        try {
          const response = await fetch(
            `/api/mutateIngredientChecked?id=${id}&checked=${checked}`
          );
          if (response.ok) {
            itemToUpdate.checked = await response.json();
          } else {
            throw new Error(await response.json());
          }
        } catch (error) {
          console.error(error);
        }

        itemToUpdate.checkedLoading = false;
        setShoppingList([...shoppingList]);
      }
    },
    [shoppingList]
  );

  const sortList = useCallback(
    (list: ShoppingList): ShoppingList => {
      return list.sort((a: ShoppingListItem, b: ShoppingListItem) => {
        if (sort.criteria === 'checked') {
          //if checked, sub-sort by area
          if (a.checked === b.checked) {
            return a['area'].localeCompare(b['area']);
          }
          return (a.checked && sort.direction === 'desc') ||
            (b.checked && sort.direction === 'asc')
            ? 1
            : -1;
        }
        //else sub-sort by checked
        if (b[sort.criteria].localeCompare(a[sort.criteria]) === 0) {
          return (a.checked && sort.direction === 'desc') ||
            (b.checked && sort.direction === 'asc')
            ? 1
            : -1;
        }
        if (sort.direction === 'asc') {
          return b[sort.criteria].localeCompare(a[sort.criteria]);
        }
        return a[sort.criteria].localeCompare(b[sort.criteria]);
      });
    },
    [sort]
  );

  const uncheckAll = useCallback(async () => {
    if (!loading) {
      const ids = shoppingList
        .filter((item) => item.checked)
        .map((item) => item.id);
      if (ids.length > 0) {
        try {
          const response = await fetch(
            `/api/uncheckAll?ids=${JSON.stringify(ids)}`
          );
          if (response.ok) {
            setForceUpdate((old) => !old);
          } else {
            throw new Error(await response.json());
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, [shoppingList, loading]);

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
  }, [firstDate, lastDate, forceUpdate]);

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
                      <TableCell align="left">
                        <TableSortLabel
                          active={sort.criteria === 'area'}
                          direction={sort.direction}
                          onClick={() => handleSortClick('area')}
                        >
                          Rayon
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sort.criteria === 'name'}
                          direction={sort.direction}
                          onClick={() => handleSortClick('name')}
                        >
                          Ingredient
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="left">
                        <TableSortLabel
                          active={sort.criteria === 'checked'}
                          direction={sort.direction}
                          onClick={() => handleSortClick('checked')}
                        >
                          OK
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortList(shoppingList).map((shoppingListItem, index) => (
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
                        <TableCell align="left">
                          {shoppingListItem.area}
                        </TableCell>
                        <TableCell align="right" component="th" scope="row">
                          {`${shoppingListItem.name} ${(
                            Number(shoppingListItem.quantity.toPrecision(2)) / 1
                          ).toString()} ${shoppingListItem.unit}`}
                        </TableCell>
                        <TableCell align="left">
                          {shoppingListItem.checkedLoading ? (
                            <CircularProgress />
                          ) : (
                            <Checkbox
                              checked={shoppingListItem.checked}
                              onClick={() =>
                                handleCheckedClick(
                                  shoppingListItem.id,
                                  !shoppingListItem.checked
                                )
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
          <Button
            className={styles.uncheckAllButton}
            variant="contained"
            onClick={uncheckAll}
          >
            Tout décocher
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Home;
