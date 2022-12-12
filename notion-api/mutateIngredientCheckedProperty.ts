import { Client } from '@notionhq/client';

type mutateIngredientCheckedPropertyProperties = {
  id: string;
  checked: boolean;
};
export const mutateIngredientCheckedProperty = async (
  ingredient: mutateIngredientCheckedPropertyProperties,
  client: Client
) => {
  try {
    await client.pages.update({
      page_id: ingredient.id,
      properties: {
        OK: {
          checkbox: ingredient.checked,
        },
      },
    });
    return ingredient.checked;
  } catch (error) {
    console.error(error);
    return !ingredient.checked;
  }
};
