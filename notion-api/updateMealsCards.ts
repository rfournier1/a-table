//update meals with computed quantities inside cards

import { Client } from '@notionhq/client';
import { MealIngredients } from '../types';

type updateMealCardProps = { mealId: string; ingredients: MealIngredients };
type updateMealsCardsProps = {
  mealsIngredients: Record<string, MealIngredients>;
};

async function updateMealCard(
  { mealId, ingredients }: updateMealCardProps,
  client: Client
) {
  const mealsBlocks = await client.blocks.children.list({
    block_id: mealId,
  });
  //clear the card
  await Promise.all(
    mealsBlocks.results.map((mealBlock) =>
      client.blocks.delete({
        block_id: mealBlock.id,
      })
    )
  );
  //then push the list
  client.blocks.children.append({
    block_id: mealId,
    children: Object.values(ingredients).map((ingredient) => ({
      paragraph: {
        rich_text: [
          {
            text: {
              content: `${ingredient.name} : ${ingredient.quantity} ${ingredient.unit}`,
            },
          },
        ],
      },
    })),
  });
}
export async function updateMealsCards(
  { mealsIngredients }: updateMealsCardsProps,
  client: Client
) {
  await Promise.all(
    Object.entries(mealsIngredients).map(([mealId, ingredients]) =>
      updateMealCard({ mealId, ingredients }, client)
    )
  );
}
