export default function NewRecipePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Recipe</h1>
          <p className="text-gray-600 mb-8">
            This feature is coming soon. For now, you can use the Developer Tools to seed sample recipes.
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Setup</h3>
              <p className="text-blue-800 mb-3">
                Get started quickly by seeding sample recipes with the Developer Tools.
              </p>
              <a 
                href="/dashboard/recipes"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Recipes
              </a>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Recipe name and description</li>
                <li>• Ingredient management with quantities</li>
                <li>• Step-by-step instructions</li>
                <li>• Target ABV and batch size settings</li>
                <li>• LAL conservation calculations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'New Recipe - Distil',
  description: 'Create a new gin recipe'
}









