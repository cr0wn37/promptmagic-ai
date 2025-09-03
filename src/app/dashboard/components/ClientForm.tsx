    'use client';
    import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

    interface Client {
        id: string;
        user_id: string;
        client_name: string;
        client_data: Record<string, any>;
        created_at: string;
    }

    interface ClientFormProps {
        initialData: Client | null;
        onSave: (client_name: string, client_data: Record<string, any>) => void;
        onCancel: () => void;
        isSaving: boolean;
    }

    const clientFieldsMap: Record<string, string[]> = {
    'Fitness': ['age', 'gender', 'goal', 'injury_history', 'notes'],
    'Marketing': ['company_name', 'target_audience', 'brand_voice', 'notes'],
    'HR': ['job_title', 'department', 'start_date', 'notes'],
    'Sales': ['company_name', 'client_role', 'client_pain_point', 'notes'],
    'Education': ['subject', 'grade_level', 'learning_style', 'notes'],
    'Finance': ['net_worth', 'risk_tolerance', 'investment_goals', 'notes'],
    'General': ['notes'],
  };


    export default function ClientForm({ initialData, onSave, onCancel, isSaving }: ClientFormProps) {
        const [clientName, setClientName] = useState(initialData?.client_name || '');
        const [clientType, setClientType] = useState('General');
        const [clientData, setClientData] = useState<Record<string, any>>(initialData?.client_data || {});
        const [hasError, setHasError] = useState(false);

        useEffect(() => {
            if (initialData) {
                setClientName(initialData.client_name);
                setClientData(initialData.client_data);
               
                const keys = Object.keys(initialData.client_data);
                for (const type of Object.keys(clientFieldsMap)) {
                    if (keys.some(key => clientFieldsMap[type].includes(key))) {
                        setClientType(type);
                        break;
                    }
                }
            } else {
                setClientName('');
                setClientData({});
                setClientType('General');
            }
            setHasError(false);
        }, [initialData]);

        const handleSubmit = () => {
            if (!clientName.trim()) {
                setHasError(true);
                return;
            }
            setHasError(false);
            onSave(clientName.trim(), clientData);
        };

        const handleClientDataChange = (key: string, value: any) => {
            setClientData(prev => ({ ...prev, [key]: value }));
        };
        
        return (
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="clientName" className="text-right text-gray-700">Client Name</label>
                    <input
                        id="clientName"
                        type="text"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className={`col-span-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mint-palette-400 transition-all ${hasError && !clientName.trim() ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., John Doe"
                    />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="clientType" className="text-right text-gray-700">Client Type</label>
                    <select
                        id="clientType"
                        value={clientType}
                        onChange={e => {
                            setClientType(e.target.value);
                            setClientData({}); 
                        }}
                        className="col-span-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mint-palette-400 transition-all border-gray-300"
                    >
                        {Object.keys(clientFieldsMap).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {clientFieldsMap[clientType].map(key => (
                    <div key={key} className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor={key} className="text-right text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}
                        </label>
                        <input
                            id={key}
                            type={key.includes('date') ? 'date' : 'text'}
                            value={clientData[key] || ''}
                            onChange={e => handleClientDataChange(key, e.target.value)}
                            className="col-span-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-mint-palette-400 transition-all border-gray-300"
                            placeholder={`e.g., ${key.replace(/_/g, ' ')}`}
                        />
                    </div>
                ))}

                {hasError && <p className="text-red-500 text-sm text-center col-span-full">Please enter a client name.</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onCancel} disabled={isSaving} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 rounded-lg bg-mint-palette-500 text-white hover:bg-mint-palette-600 transition-all">
                        {isSaving ? 'Saving...' : 'Save Client'}
                    </button>
                </div>
            </div>
        );
    }
    