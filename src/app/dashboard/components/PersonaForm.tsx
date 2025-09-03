'use client';

import React, { useState, useEffect } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface PersonaFormProps {
  initialData: { id?: string; name: string; instructions: string } | null;
  onSave: (name: string, instructions: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const PersonaForm: React.FC<PersonaFormProps> = ({ initialData, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setInstructions(initialData.instructions);
    } else {
      setName('');
      setInstructions('');
    }
    setHasError(false);
  }, [initialData]);

  const handleSubmit = () => {
    if (!name.trim() || !instructions.trim()) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onSave(name.trim(), instructions.trim());
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="name" className="text-right text-gray-700"> 
          Name
        </label>
        <input 
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`col-span-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mint-palette-400 transition-all ${
            hasError && !name.trim() ? 'border-red-500' : 'border-gray-300'
          } bg-white text-gray-900`}
          placeholder="e.g., Marketing Expert, Friendly Coach"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="instructions" className="text-right text-gray-700"> 
          Instructions
        </label>
        <textarea 
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className={`col-span-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mint-palette-400 transition-all ${
            hasError && !instructions.trim() ? 'border-red-500' : 'border-gray-300'
          } bg-white text-gray-900`}
          placeholder="e.g., Act as a highly creative marketing expert. Generate concise and engaging copy. Avoid jargon."
          rows={5}
        />
      </div>
      {hasError && (
        <p className="text-red-500 text-sm text-center col-span-full">Please fill in all required fields.</p>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-mint-palette-500 text-white hover:bg-mint-palette-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Persona'}
        </button>
      </div>
    </div>
  );
};

export default PersonaForm;
