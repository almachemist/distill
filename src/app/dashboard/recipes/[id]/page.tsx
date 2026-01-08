import { RecipeDetail } from '@/modules/recipes/components/RecipeDetail'

export default async function RecipeDetailPage(props: PageProps<"/dashboard/recipes/[id]">) {
  const { id } = await props.params
  return <RecipeDetail recipeId={id} />
}

export const metadata = {
  title: 'Recipe Details - Distil',
  description: 'View recipe ingredients and start production batches'
}
