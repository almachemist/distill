import { RecipeDetail } from '@/modules/recipes/components/RecipeDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params
  return <RecipeDetail recipeId={id} />
}

export const metadata = {
  title: 'Recipe Details - Distil',
  description: 'View recipe ingredients and start production batches'
}
