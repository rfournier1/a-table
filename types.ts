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
