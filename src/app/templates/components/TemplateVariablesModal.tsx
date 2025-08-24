'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Client {
  id: string;
  client_name: string;
  client_data: any;
}

interface TemplateVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: Record<string, string>;
  onSaveAndGenerate: (vars: Record<string, string>, clientId: string | null) => void;
  templateText: string;
  category: string;
  isGenerating: boolean;
  clients: Client[];
}

const TemplateVariablesModal: React.FC<TemplateVariablesModalProps> = ({
  isOpen,
  onClose,
  variables,
  onSaveAndGenerate,
  templateText,
  category,
  isGenerating,
  clients,
}) => {
  const [localVariables, setLocalVariables] = useState(variables);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    // Reset local state when the modal opens with new variables
    if (isOpen) {
      setLocalVariables(variables);
      setSelectedClientId(null);
    }
  }, [isOpen, variables]);

  const handleVariableChange = useCallback((name: string, value: string) => {
    setLocalVariables((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClientSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);

    if (clientId) {
      const selectedClient = clients.find((c) => c.id === clientId);
      if (selectedClient) {
        setLocalVariables((prev) => {
          const newVars = { ...prev };
          Object.keys(selectedClient.client_data).forEach((key) => {
            if (newVars.hasOwnProperty(key)) {
              newVars[key] = String(selectedClient.client_data[key]);
            }
          });
          return newVars;
        });
      }
    } else {
      // If "No Client Selected" is chosen, reset the variables to their original state
      setLocalVariables(variables);
    }
  }, [clients, variables]);

  const handleSubmit = () => {
    onSaveAndGenerate(localVariables, selectedClientId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Use Template</DialogTitle>
          <DialogDescription>
            Fill in the variables below to generate your prompt based on the
            template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Template
            </label>
            <p className="text-sm text-gray-500 overflow-y-auto max-h-32">
              {templateText}
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="client-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select Client (Optional)
            </label>
            <select
              id="client-select"
              value={selectedClientId || ''}
              onChange={handleClientSelect}
              className="w-full border rounded-lg p-2"
              disabled={isGenerating}
            >
              <option value="">No Client Selected</option>
              {/* FIX: Add conditional check to prevent .map() on undefined */}
              {clients && clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                </option>
              ))}
            </select>
          </div>
          {Object.keys(localVariables).map((key) => (
            <div key={key} className="grid grid-cols-4 items-center gap-4">
              <label htmlFor={key} className="text-right capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                id={key}
                value={localVariables[key]}
                onChange={(e) => handleVariableChange(key, e.target.value)}
                className="col-span-3 px-3 py-2 border rounded-md"
                disabled={isGenerating}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating}
            className="px-6 py-2 rounded-lg bg-mint-palette-500 text-white hover:bg-mint-palette-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate AI Reply'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateVariablesModal;
