export const getInitDates = () => {
  let lastTuesday = new Date();
  lastTuesday.setDate(lastTuesday.getDate() - (lastTuesday.getDay() % 7) + 2);
  let nextMonday = new Date();
  nextMonday.setDate(lastTuesday.getDate() + 6);

  return {
    firstDate: lastTuesday,
    lastDate: nextMonday,
  };
};
