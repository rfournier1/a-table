export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  area: string;
  checked: boolean;
  checkedLoading: boolean;
};

export type ShoppingList = ShoppingListItem[];

export type useMealsProperties = {
  firstDate: Date;
  lastDate: Date;
  mealDatabaseId: string;
  additionalIngredientsDatabaseId: string;
};

export type useDatabaseIdProperties = {
  name: string;
};

export type useReciepesProperties = {
  reciepesDatabaseId: string;
};

export type useIngredientsProperties = {
  ingredientsDatabaseId: string;
};

export type useReciepeIngredientsRelationsProperties = {
  reciepeIngredientsRelationDatabaseId: string;
};

export type useDailyMealsProperties = {
  date: Date;
  reciepeIngredientsRelationDatabaseId: string;
  mealDatabaseId: string;
};

export interface DishIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Dish {
  title: string;
  ingredients: DishIngredient[];
}

export interface DailyMeal {
  dishes: Dish[];
  numberOfAttendingPersons: number;
  title: string;
}

declare module 'iron-session' {
  interface IronSessionData {
    notionToken?: string;
  }
}
