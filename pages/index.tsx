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
import { getInitDates } from '../helpers/getInitDates';
import { useMeals } from '../hooks/useMeals';
import { useReciepes } from '../hooks/useReciepes';
import { useReciepeIngredientsRelations } from '../hooks/useReciepesIngredientsRelations';
import { useIngredients } from '../hooks/useIngredients';
import { getShoppingListFromMeals } from '../helpers/getShoppingListFromMeals';
import { useDatabaseId } from '../hooks/useDatabaseId';
import {
  INGREDIENT_DB_NAME,
  MEAL_DB_NAME,
  RECIEPE_DB_NAME,
  RECIEPE_INGREDIENTS_RELATIONS_DB_NAME,
} from '../notion-api/keys';
type Sort = {
  criteria: 'name' | 'area' | 'checked';
  direction: 'asc' | 'desc';
};

function Home() {
  const { firstDate: initFirstDate, lastDate: initLastDate } = getInitDates();

  const [shoppingList, setShoppingList] = useState<ShoppingList>([]);
  const [firstDate, setFirstDate] = useState(new Date(initFirstDate));
  const [lastDate, setLastDate] = useState(new Date(initLastDate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<Sort>({
    criteria: 'area',
    direction: 'desc',
  });
  const { id: mealDatabaseId, isError: isMealDBError } = useDatabaseId({
    name: MEAL_DB_NAME,
  });
  const {
    id: additionalIngredientsDatabaseId,
    isError: isAdditionalIngredientsDBError,
  } = useDatabaseId({ name: 'Additional ingredients' });
  const { id: reciepesDatabaseId, isError: isReciepesDBError } = useDatabaseId({
    name: RECIEPE_DB_NAME,
  });
  const { id: ingredientsDatabaseId, isError: isIngredientsDBError } =
    useDatabaseId({ name: INGREDIENT_DB_NAME });
  const {
    id: reciepeIngredientsRelationDatabaseId,
    isError: isReciepeIngredientsRelationDBError,
  } = useDatabaseId({ name: RECIEPE_INGREDIENTS_RELATIONS_DB_NAME });
  const {
    meals,
    additonnalIngredients,
    isLoading: isMealsLoading,
    isError: isMealsError,
  } = useMeals({
    mealDatabaseId,
    additionalIngredientsDatabaseId,
    firstDate,
    lastDate,
  });
  const {
    reciepes,
    isLoading: isReciepesLoading,
    isError: isReciepesError,
  } = useReciepes({ reciepesDatabaseId });
  const {
    reciepeIngredientsRelations,
    isLoading: isReciepeIngredientsRelationsLoading,
    isError: isReciepeIngredientsRelationsError,
  } = useReciepeIngredientsRelations({ reciepeIngredientsRelationDatabaseId });
  const {
    ingredients,
    isLoading: isIngredientsLoading,
    isError: isIngredientsError,
    refresh: refreshIngredients,
  } = useIngredients({ ingredientsDatabaseId });
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
            refreshIngredients();
          } else {
            throw new Error(await response.json());
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, [shoppingList, loading, refreshIngredients]);

  useEffect(() => {
    if (
      meals &&
      reciepes &&
      ingredients &&
      additonnalIngredients &&
      reciepeIngredientsRelations
    ) {
      setShoppingList(
        getShoppingListFromMeals({
          meals,
          reciepes,
          ingredients,
          additonnalIngredients,
          reciepeIngredientsRelations: Object.assign(
            {},
            ...reciepeIngredientsRelations
          ),
        })
      );
    }
  }, [
    meals,
    reciepes,
    ingredients,
    additonnalIngredients,
    reciepeIngredientsRelations,
  ]);

  useEffect(() => {
    setLoading(
      isIngredientsLoading ||
        isReciepesLoading ||
        isMealsLoading ||
        isReciepeIngredientsRelationsLoading
    );
  }, [
    isIngredientsLoading,
    isMealsLoading,
    isReciepeIngredientsRelationsLoading,
    isReciepesLoading,
  ]);

  useEffect(() => {
    setError(
      isIngredientsError ||
        isMealsError ||
        isReciepesError ||
        isReciepeIngredientsRelationsError
    );
  }, [
    isIngredientsError,
    isMealsError,
    isReciepeIngredientsRelationsError,
    isReciepesError,
  ]);
  return (
    <div className={styles.container}>
      <Head>
        <title>À table !</title>
        <meta
          name="description"
          content="Generating a shopping list from our collocation's notion"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Notre liste de courses</h1>
        <div className={styles.content}>
          <div className={styles.datePickers}>
            <div className={styles.datePicker}>
              <Box> du </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={firstDate}
                  onChange={(newValue) => {
                    setFirstDate(newValue ?? initFirstDate);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
            <div className={styles.datePicker}>
              <Box> au </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={lastDate}
                  onChange={(newValue) => {
                    setLastDate(newValue ?? initLastDate);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className={styles.list}>
            {loading ? (
              <>
                <div>
                  Loading Ingredients ...
                  {isIngredientsLoading ? <CircularProgress /> : <>✅</>}
                </div>
                <div>
                  Loading Reciepes ...{' '}
                  {isReciepesLoading ? <CircularProgress /> : <>✅</>}
                </div>
                <div>
                  Loading Reciepes to ingredient relations ...{' '}
                  {isReciepeIngredientsRelationsLoading ? (
                    <CircularProgress />
                  ) : (
                    <>✅</>
                  )}
                </div>
                <div>
                  Loading meals ...{' '}
                  {isMealsLoading ? <CircularProgress /> : <>✅</>}
                </div>
              </>
            ) : error ? (
              <div>
                <div>
                  Something went wrong, your request is probably too heavy for
                  the server
                </div>
                <div className={styles.error}>{JSON.stringify(error)}</div>
              </div>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ maxWidth: '100%' }} aria-label="shopping list">
                  <TableHead sx={{ background: styleVariables.secondary }}>
                    <TableRow>
                      <TableCell align="left">
                        <TableSortLabel
                          active={sort.criteria === 'name'}
                          direction={sort.direction}
                          onClick={() => handleSortClick('name')}
                        >
                          Ingredient
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sort.criteria === 'area'}
                          direction={sort.direction}
                          onClick={() => handleSortClick('area')}
                        >
                          Rayon
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
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
                      <>
                        <TableRow
                          key={shoppingListItem.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            background:
                              index % 2 === 1
                                ? 'transparent'
                                : `${styleVariables.secondaryLight}4c`,
                            borderTop:
                              (sort.criteria === 'area' &&
                                index > 0 &&
                                shoppingListItem.area !==
                                  shoppingList[index - 1].area) ||
                              (sort.criteria === 'checked' &&
                                index > 0 &&
                                shoppingListItem.checked !==
                                  shoppingList[index - 1].checked)
                                ? `solid 2px ${styleVariables.secondary}`
                                : '',
                          }}
                        >
                          <TableCell align="left" component="th" scope="row">
                            {`${shoppingListItem.name} ${(
                              Number(shoppingListItem.quantity.toPrecision(2)) /
                              1
                            ).toString()} ${shoppingListItem.unit}`}
                          </TableCell>
                          <TableCell align="right">
                            {shoppingListItem.area}
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
                      </>
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
