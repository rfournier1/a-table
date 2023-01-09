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
};

export type useAdditionalIngredientsProperties = {
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

export type MealIngredients = Record<
  string,
  { quantity: number; unit: string; name: string }
>;
