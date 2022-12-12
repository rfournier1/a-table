import Head from 'next/head';
import styles from '../styles/Daily.module.css';
import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Box from '@mui/material/Box';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
import { useDatabaseId } from '../hooks/useDatabaseId';
import {
  MEAL_DB_NAME,
  RECIEPE_INGREDIENTS_RELATIONS_DB_NAME,
} from '../notion-api/keys';
import { useDailyMeals } from '../hooks/useDailyMeals';
function Home() {
  const [date, setDate] = useState<Date>(new Date());

  dayjs.locale('fr');
  const { id: mealDatabaseId, isError: isMealDBError } = useDatabaseId({
    name: MEAL_DB_NAME,
  });
  const {
    id: reciepeIngredientsRelationDatabaseId,
    isError: isReciepeIngredientsRelationDBError,
  } = useDatabaseId({ name: RECIEPE_INGREDIENTS_RELATIONS_DB_NAME });
  const { meals, isLoading, isError } = useDailyMeals({
    date,
    mealDatabaseId,
    reciepeIngredientsRelationDatabaseId,
  });
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
        <h1 className={styles.title}>Recettes du jour</h1>
        <div className={styles.content}>
          <div className={styles.datePickers}>
            <div className={styles.datePicker}>
              <Box> Le </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={date}
                  onChange={(newValue) => {
                    if (newValue !== null) setDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className={styles.list}>
            {isLoading ? (
              <CircularProgress />
            ) : isError ? (
              <div>
                Something went wrong, your request is probably too heavy for the
                server
              </div>
            ) : (
              <div>
                {meals?.map((meal, mealIndex) => (
                  <div key={`meal-${mealIndex}`}>
                    <h2 className={styles.mealTitle}>
                      {meal.title} pour {meal.numberOfAttendingPersons} personne
                      {meal.numberOfAttendingPersons > 1 ? 's' : ''}
                    </h2>
                    {meal.dishes.map((dish, dishIndex) => (
                      <div key={`dish-${dishIndex}`}>
                        <h3 className={styles.dishTitle}>{dish.title}</h3>
                        <ul className={styles.ingredients}>
                          {dish.ingredients.map(
                            (ingredient, ingredientIndex) => (
                              <li key={`ingredient-${ingredientIndex}`}>
                                {ingredient.name}
                                {' : '}
                                {`${(
                                  Number(ingredient.quantity.toPrecision(2)) / 1
                                ).toString()}`}{' '}
                                {ingredient.unit}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
