'use client'

import React, { useState, useEffect } from 'react';
import { BatchSchema, type Batch, generateUUID } from '@/types/schema';
import { deepMerge, calcLAL, sanitizeData } from '@/lib/deepMerge';
import { upsertBatchLocal } from '@/lib/saveBatch';
import { PercentInput, NumberInput, TextInput } from '@/components/PercentInput';

interface BatchFormProps {
  initialBatch?: Partial<Batch>;
  onSave?: (batch: Batch) => void;
  onCancel?: () => void;
}

export function BatchForm({ initialBatch, onSave, onCancel }: BatchFormProps) {
  const [formData, setFormData] = useState<Partial<Batch>>({
    spiritRunId: '',
    sku: '',
    description: null,
    date: new Date().toISOString().split('T')[0],
    boilerStartTime: null,
    boilerOn: null,
    stillUsed: '',
    chargeAdjustment: {
      components: [],
      total: {
        volume_L: null,
        abv_percent: null,
        lal: null
      }
    },
    stillSetup: {
      elements: null,
      steeping: null,
      plates: null,
      options: null
    },
    botanicals: [],
    totalBotanicals_g: null,
    totalBotanicals_percent: null,
    botanicalsPerLAL: null,
    runData: [],
    totalRun: {},
    output: [],
    dilutions: [],
    finalOutput: {},
    notes: null,
    ...initialBatch
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-calculate LAL when volume or ABV changes
  const updateLAL = (field: string, value: number | null, index?: number) => {
    if (field.includes('volume_L') || field.includes('abv_percent')) {
      const baseField = field.replace('_L', '').replace('_percent', '');
      const volumeField = `${baseField}_L`;
      const abvField = `${baseField}_percent`;
      
      let volume: number | null = null;
      let abv: number | null = null;
      
      if (field.includes('volume_L')) {
        volume = value;
        abv = (index !== undefined ? formData.runData?.[index]?.abv_percent : 
              formData.chargeAdjustment?.total?.abv_percent) ?? null;
      } else {
        abv = value;
        volume = (index !== undefined ? formData.runData?.[index]?.volume_L :
                formData.chargeAdjustment?.total?.volume_L) ?? null;
      }
      
      const lal = calcLAL(volume, abv);
      
      if (index !== undefined && formData.runData) {
        // Update runData item
        const updatedRunData = [...formData.runData];
        updatedRunData[index] = { ...updatedRunData[index], lal };
        setFormData(prev => ({ ...prev, runData: updatedRunData }));
      } else {
        // Update charge total
        setFormData(prev => ({
          ...prev,
          chargeAdjustment: {
            ...prev.chargeAdjustment!,
            total: {
              ...prev.chargeAdjustment!.total,
              lal
            }
          }
        }));
      }
    }
  };

  const addArrayItem = (arrayName: keyof Batch, item: any) => {
    const newItem = { id: generateUUID(), ...item };
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as any[] || []), newItem]
    }));
  };

  const updateArrayItem = (arrayName: keyof Batch, index: number, field: string, value: any) => {
    setFormData(prev => {
      const array = prev[arrayName] as any[];
      const updatedArray = [...array];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      return { ...prev, [arrayName]: updatedArray };
    });
    
    // Auto-calculate LAL if needed
    updateLAL(field, value, index);
  };

  const removeArrayItem = (arrayName: keyof Batch, index: number) => {
    setFormData(prev => {
      const array = prev[arrayName] as any[];
      const updatedArray = array.filter((_, i) => i !== index);
      return { ...prev, [arrayName]: updatedArray };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors([]);

      // Validate and parse the form data
      const validatedData = BatchSchema.parse(formData);
      
      // Save using the safe upsert function
      const savedBatch = await upsertBatchLocal(validatedData.spiritRunId, validatedData);
      
      if (onSave) {
        onSave(savedBatch);
      }
      
      console.log('Batch saved successfully:', savedBatch);
    } catch (error) {
      console.error('Validation error:', error);
      if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['Unknown error occurred']);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Distillation Batch Form</h2>
        <p className="text-gray-600">Complete distillation tracking with bulletproof data persistence</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium mb-2">Validation Errors:</h3>
          <ul className="text-red-700 text-sm">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spirit Run ID</label>
              <TextInput
                value={formData.spiritRunId ?? null}
                onChange={(value) => setFormData(prev => ({ ...prev, spiritRunId: value || '' }))}
                placeholder="e.g., SPIRIT-GIN-RF-30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <TextInput
                value={formData.sku ?? null}
                onChange={(value) => setFormData(prev => ({ ...prev, sku: value || '' }))}
                placeholder="e.g., Rainforest Gin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Still Used</label>
              <TextInput
                value={formData.stillUsed ?? null}
                onChange={(value) => setFormData(prev => ({ ...prev, stillUsed: value || '' }))}
                placeholder="e.g., Carrie, Roberta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boiler On</label>
              <TextInput
                value={formData.boilerOn ?? null}
                onChange={(value) => setFormData(prev => ({ ...prev, boilerOn: value ?? null }))}
                placeholder="e.g., 35A, 07:05"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <TextInput
                value={formData.description ?? null}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value ?? null }))}
                placeholder="Batch description"
              />
            </div>
          </div>
        </div>

        {/* Charge Components */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Charge Components</h3>
            <button
              type="button"
              onClick={() => addArrayItem('chargeAdjustment', {
                source: '',
                type: 'ethanol',
                volume_L: null,
                abv_percent: null,
                lal: null,
                expected_percent: null
              })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Component
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.chargeAdjustment?.components?.map((component, index) => (
              <div key={component.id || index} className="bg-white p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <TextInput
                      value={component.source}
                      onChange={(value) => updateArrayItem('chargeAdjustment', index, 'source', value)}
                      placeholder="e.g., Manildra NC96"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={component.type}
                      onChange={(e) => updateArrayItem('chargeAdjustment', index, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                    >
                      <option value="ethanol">Ethanol</option>
                      <option value="dilution">Dilution</option>
                      <option value="water">Water</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                    <NumberInput
                      value={component.volume_L}
                      onChange={(value) => updateArrayItem('chargeAdjustment', index, 'volume_L', value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
                    <PercentInput
                      value={component.abv_percent}
                      onChange={(value) => updateArrayItem('chargeAdjustment', index, 'abv_percent', value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LAL</label>
                    <NumberInput
                      value={component.lal}
                      onChange={(value) => updateArrayItem('chargeAdjustment', index, 'lal', value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('chargeAdjustment', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Run Data */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Run Data</h3>
            <button
              type="button"
              onClick={() => addArrayItem('runData', {
                time: null,
                phase: '',
                volume_L: null,
                abv_percent: null,
                lal: null,
                observations: null
              })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Run Data
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.runData?.map((run, index) => (
              <div key={run.id || index} className="bg-white p-4 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <TextInput
                      value={run.time}
                      onChange={(value) => updateArrayItem('runData', index, 'time', value)}
                      placeholder="e.g., 08:30 AM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                    <TextInput
                      value={run.phase}
                      onChange={(value) => updateArrayItem('runData', index, 'phase', value)}
                      placeholder="e.g., Foreshots"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                    <NumberInput
                      value={run.volume_L}
                      onChange={(value) => updateArrayItem('runData', index, 'volume_L', value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
                    <PercentInput
                      value={run.abv_percent}
                      onChange={(value) => updateArrayItem('runData', index, 'abv_percent', value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LAL</label>
                    <NumberInput
                      value={run.lal}
                      onChange={(value) => updateArrayItem('runData', index, 'lal', value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('runData', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                  <TextInput
                    value={run.observations}
                    onChange={(value) => updateArrayItem('runData', index, 'observations', value)}
                    placeholder="Run observations..."
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value || null }))}
            placeholder="Additional notes about this distillation batch..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Batch'}
        </button>
      </div>
    </div>
  );
}

