'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PersonaForm from './PersonaForm';

interface Persona {
  id: string;
  user_id: string;
  name: string;
  instructions: string;
  created_at: string;
}

interface PersonaManagementProps {
  initialPersonas: Persona[];
  onAddPersona: (name: string, instructions: string) => Promise<{ success: boolean; message: string }>;
  onUpdatePersona: (id: string, name: string, instructions: string) => Promise<{ success: boolean; message: string }>;
  onDeletePersona: (id: string) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_PERSONA = {
  id: 'default',
  name: 'Default Persona',
  instructions: 'You are a creative, helpful, and versatile AI assistant. Your primary goal is to provide clear, comprehensive, and well-structured responses to any query. You are not bound by a specific persona. Also, each category is tailored with different pre-instructions according to their fields.',
  created_at: new Date().toISOString(),
};

const PersonaManagement: React.FC<PersonaManagementProps> = ({ initialPersonas, onAddPersona, onUpdatePersona, onDeletePersona }) => {
  const { toast } = useToast();
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [loading, setLoading] = useState(false);

  const [showPersonaFormDialog, setShowPersonaFormDialog] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [personaToDeleteId, setPersonaToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPersonas(initialPersonas);
  }, [initialPersonas]);

  const handleAddClick = useCallback(() => {
    setEditingPersona(null);
    setShowPersonaFormDialog(true);
  }, []);

  const handleEditClick = useCallback((persona: Persona) => {
    setEditingPersona(persona);
    setShowPersonaFormDialog(true);
  }, []);

  const handleSavePersona = useCallback(async (name: string, instructions: string) => {
    setLoading(true);
    let result;
    if (editingPersona) {
      result = await onUpdatePersona(editingPersona.id, name, instructions);
    } else {
      result = await onAddPersona(name, instructions);
    }

    if (result.success) {
      toast({
        title: editingPersona ? "Persona Updated!" : "Persona Added!",
        description: result.message,
        variant: "default",
      });
      setShowPersonaFormDialog(false);
    } else {
      toast({
        title: "Operation Failed",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [editingPersona, onAddPersona, onUpdatePersona, toast]);

  const confirmDelete = useCallback((id: string) => {
    setPersonaToDeleteId(id);
    setShowConfirmDeleteDialog(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (personaToDeleteId) {
      setLoading(true);
      setShowConfirmDeleteDialog(false);
      
      setPersonas(prev => prev.filter(p => p.id !== personaToDeleteId));

      const result = await onDeletePersona(personaToDeleteId);

      if (result.success) {
        toast({
          title: "Persona Deleted!",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: result.message,
          variant: "destructive",
        });
        setPersonas(initialPersonas);
      }
      setPersonaToDeleteId(null);
      setLoading(false);
    }
  }, [personaToDeleteId, onDeletePersona, toast, initialPersonas]);


  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Custom Personas</h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-800 transition-all duration-300 transform hover:-translate-y-0.5"
          disabled={loading}
        >
          Add New Persona
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div key={DEFAULT_PERSONA.id} className="relative bg-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-200 animate-pulse-slow"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{DEFAULT_PERSONA.name}</h3>
           
              <p className="text-gray-600 text-sm mb-4">{DEFAULT_PERSONA.instructions}</p>
            </div>
            <div className="flex justify-end items-center space-x-3 mt-4">
              <span className="text-gray-400 text-sm italic">System Default</span>
            </div>
          </div>
        </div>

        {personas.map((persona) => (
          <div key={persona.id} className="bg-mint-palette-50 rounded-xl p-6 border border-mint-palette-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{persona.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{persona.instructions}</p>
            </div>
            <div className="flex justify-end items-center space-x-3 mt-4">
              <button
                onClick={() => handleEditClick(persona)}
                className="text-mint-palette-500 hover:text-mint-palette-600 text-sm transition-all duration-200 transform hover:scale-110"
                title="Edit Persona"
                disabled={loading}
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(persona.id)}
                className="text-red-500 hover:text-red-700 text-sm transition-all duration-200 transform hover:scale-110"
                title="Delete Persona"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showPersonaFormDialog} onOpenChange={setShowPersonaFormDialog}>
        <DialogContent className="sm:max-w-[475px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              {editingPersona ? 'Edit Persona' : 'Add New Persona'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              {editingPersona ? 'Update the details of your AI persona.' : 'Create a new AI persona with specific instructions.'}
            </DialogDescription>
          </DialogHeader>
          <PersonaForm
            initialData={editingPersona}
            onSave={handleSavePersona}
            onCancel={() => setShowPersonaFormDialog(false)}
            isSaving={loading}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your persona.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPersonaToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default PersonaManagement;
