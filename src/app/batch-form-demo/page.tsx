'use client'
export const dynamic = 'force-dynamic'

import React, { useState } from 'react';
import { BatchForm } from '@/components/BatchForm';
import { type Batch } from '@/types/schema';

export default function BatchFormDemo() {
  const [savedBatch, setSavedBatch] = useState<Batch | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleSave = (batch: Batch) => {
    setSavedBatch(batch);
    setShowForm(false);
    console.log('Batch saved:', batch);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleNewBatch = () => {
    setSavedBatch(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bulletproof Distillation Batch Form
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete distillation tracking with guaranteed data persistence. 
            Every detail you enter is coerced, validated, and safely stored.
          </p>
        </div>

        {showForm ? (
          <BatchForm
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="text-center">
            {savedBatch ? (
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Batch Saved Successfully!
                </h2>
                <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Saved Data:</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>ID:</strong> {savedBatch.spiritRunId}</p>
                    <p><strong>SKU:</strong> {savedBatch.sku}</p>
                    <p><strong>Date:</strong> {savedBatch.date}</p>
                    <p><strong>Still:</strong> {savedBatch.stillUsed}</p>
                    <p><strong>Components:</strong> {savedBatch.chargeAdjustment.components.length}</p>
                    <p><strong>Run Data Points:</strong> {savedBatch.runData.length}</p>
                  </div>
                </div>
                <button
                  onClick={handleNewBatch}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create New Batch
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Form Cancelled
                </h2>
                <p className="text-gray-600 mb-6">
                  No data was saved. Click below to start a new batch.
                </p>
                <button
                  onClick={handleNewBatch}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Start New Batch
                </button>
              </div>
            )}
          </div>
        )}

        {/* Features List */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Bulletproof Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-indigo-600 text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Coercion</h3>
              <p className="text-sm text-gray-600">
                Automatically converts "81.8%" → 81.8, handles null values properly
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-4xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Deep Merge</h3>
              <p className="text-sm text-gray-600">
                Preserves existing data, only updates changed fields
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-4xl mb-3">✅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Schema Validation</h3>
              <p className="text-sm text-gray-600">
                Zod validates all data before saving, prevents corruption
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-4xl mb-3">🆔</div>
              <h3 className="font-semibold text-gray-900 mb-2">Stable IDs</h3>
              <p className="text-sm text-gray-600">
                Every array item gets a UUID, prevents data loss on updates
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-4xl mb-3">🧮</div>
              <h3 className="font-semibold text-gray-900 mb-2">Auto Calculations</h3>
              <p className="text-sm text-gray-600">
                LAL automatically calculated when volume or ABV changes
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-600 text-4xl mb-3">💾</div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe Storage</h3>
              <p className="text-sm text-gray-600">
                Never drops fields, handles undefined vs null correctly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
