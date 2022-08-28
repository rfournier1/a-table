import { Client } from '@notionhq/client';

const notionv1Client = new Client({
  auth: process.env.NOTION_ITEGRATION_TOKEN,
});

type mutateIngredientCheckedPropertyProperties = {
  id: string;
  checked: boolean;
};
export const mutateIngredientCheckedProperty = async (
  ingredient: mutateIngredientCheckedPropertyProperties
) => {
  try {
    await notionv1Client.pages.update({
      page_id: ingredient.id,
      properties: {
        OK: {
          checkbox: ingredient.checked,
        },
      },
    });
    return ingredient.checked;
  } catch (error) {
    console.log(error);
    return !ingredient.checked;
  }
};
