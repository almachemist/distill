'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RecipesList } from '@/modules/recipes/components/RecipesList'

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'comprehensive' | 'firestore'>('basic')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-600 mt-2">Manage your distillery recipes and formulations</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'basic', label: 'Basic Recipes', description: 'Simple recipe management' },
            { key: 'comprehensive', label: 'All Gin Recipes', description: 'Complete gin recipe database with costs' },
            { key: 'firestore', label: 'Firestore System', description: 'Advanced recipe system with inventory integration' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-xs font-normal text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <div className="container mx-auto">
            <RecipesList />
          </div>
        )}

        {activeTab === 'comprehensive' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Gin Recipes</h3>
              <p className="text-gray-600 mb-4">
                Complete gin recipe database with detailed botanical costs and production data
              </p>
              <Link
                href="/dashboard/recipes/comprehensive"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View All Gin Recipes
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'firestore' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Firestore Recipe System</h3>
              <p className="text-gray-600 mb-4">
                Advanced recipe management with real-time inventory integration and cost tracking
              </p>
              <Link
                href="/dashboard/recipes/firestore"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Open Firestore System
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* System Comparison */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Recipe System Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Basic Recipes</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Simple recipe management</li>
              <li>• Basic ingredient tracking</li>
              <li>• Standard recipe formats</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">All Gin Recipes</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Complete gin database</li>
              <li>• Detailed botanical costs</li>
              <li>• Production calculations</li>
              <li>• Recipe costing analysis</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Firestore System</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Real-time inventory sync</li>
              <li>• Automatic stock deduction</li>
              <li>• Advanced cost tracking</li>
              <li>• Production integration</li>
              <li>• Scalable cloud storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
