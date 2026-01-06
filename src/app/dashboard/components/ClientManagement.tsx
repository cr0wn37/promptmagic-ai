'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ClientForm from './ClientForm'; 

interface Client {
  id: string;
  user_id: string;
  client_name: string;
  client_data: any;
  created_at: string;
}

interface ClientManagementProps {
  initialClients: Client[];
  onAddClient: (client_name: string, client_data: any) => Promise<{ success: boolean; message: string }>;
  onUpdateClient: (id: string, client_name: string, client_data: any) => Promise<{ success: boolean; message: string }>;
  onDeleteClient: (id: string) => Promise<{ success: boolean; message: string }>;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ initialClients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loading, setLoading] = useState(false);

  const [showClientFormDialog, setShowClientFormDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const handleAddClick = useCallback(() => {
    setEditingClient(null);
    setShowClientFormDialog(true);
  }, []);

  const handleEditClick = useCallback((client: Client) => {
    setEditingClient(client);
    setShowClientFormDialog(true);
  }, []);

  const handleSaveClient = useCallback(async (client_name: string, client_data: any) => {
    setLoading(true);
    let result;
    if (editingClient) {
      result = await onUpdateClient(editingClient.id, client_name, client_data);
    } else {
      result = await onAddClient(client_name, client_data);
    }

    if (result.success) {
      toast({
        title: editingClient ? "Client Updated!" : "Client Added!",
        description: result.message,
        variant: "default",
      });
      setShowClientFormDialog(false);
    } else {
      toast({
        title: "Operation Failed",
        description: result.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [editingClient, onAddClient, onUpdateClient, toast]);

  const confirmDelete = useCallback((id: string) => {
    setClientToDeleteId(id);
    setShowConfirmDeleteDialog(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (clientToDeleteId) {
      setLoading(true);
      setShowConfirmDeleteDialog(false);
      
      setClients(prev => prev.filter(c => c.id !== clientToDeleteId));

      const result = await onDeleteClient(clientToDeleteId);

      if (result.success) {
        toast({
          title: "Client Deleted!",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: result.message,
          variant: "destructive",
        });
        setClients(initialClients);
      }
      setClientToDeleteId(null);
      setLoading(false);
    }
  }, [clientToDeleteId, onDeleteClient, toast, initialClients]);

  const formatClientData = (data: any) => {
    return Object.entries(data).map(([key, value]) => (
      <span key={key} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mt-2">
        <strong>{key}:</strong> {String(value)}
      </span>
    ));
  };


  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Client Profiles</h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-800 transition-all duration-300 transform hover:-translate-y-0.5"
          disabled={loading}
        >
          Add New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">
          You haven't created any client profiles yet. Click "Add New Client" to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-mint-palette-50 rounded-xl p-6 border border-mint-palette-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{client.client_name}</h3>
                <div className="text-gray-600 text-sm mb-4">
                  {formatClientData(client.client_data)}
                </div>
              </div>
              <div className="flex justify-end items-center space-x-3 mt-4">
                <button
                  onClick={() => handleEditClick(client)}
                  className="text-mint-palette-500 hover:text-mint-palette-600 text-sm transition-all duration-200 transform hover:scale-110"
                  title="Edit Client"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(client.id)}
                  className="text-red-500 hover:text-red-700 text-sm transition-all duration-200 transform hover:scale-110"
                  title="Delete Client"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showClientFormDialog} onOpenChange={setShowClientFormDialog}>
        <DialogContent className="sm:max-w-[475px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              {editingClient ? 'Update the details of your client profile.' : 'Create a new client profile to use for personalized prompts.'}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            initialData={editingClient}
            onSave={handleSaveClient}
            onCancel={() => setShowClientFormDialog(false)}
            isSaving={loading}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this client profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientManagement;
