import Head from 'next/head';
import styles from '../styles/Daily.module.css';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import Box from '@mui/material/Box';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';
import { DailyMeal } from '../api/notion/getDailyMealsInformation';

function Home() {
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [error, setError] = useState(false);

  dayjs.locale('fr');

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/daily?date=${date.toISOString().split('T')[0]}`)
      .then((res) => res.json())
      .then((data: DailyMeal[]) => {
        setMeals(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [date]);

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
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <div>
                Something went wrong, your request is probably too heavy for the
                server
              </div>
            ) : (
              <div>
                {meals.map((meal, mealIndex) => (
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
