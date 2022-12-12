const NOTION_TOKEN_API = 'https://api.notion.com/v1/oauth/token' as const;
const MEAL_DB_NAME = 'Meals planning ' as const;
const RECIEPE_DB_NAME = 'Reciepes' as const;
const INGREDIENT_DB_NAME = 'Ingredients' as const;
const RECIEPE_INGREDIENTS_RELATIONS_DB_NAME =
  'Ingredients for reciepes (relations)' as const;

export {
  NOTION_TOKEN_API,
  MEAL_DB_NAME,
  RECIEPE_DB_NAME,
  INGREDIENT_DB_NAME,
  RECIEPE_INGREDIENTS_RELATIONS_DB_NAME,
};
