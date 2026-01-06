// src/components/VariableInputForm.tsx
"use client";

import React, { useEffect, useState } from "react";

interface VariableInputFormProps {
  variables: string[];
  selectedClient?: {
    client_data: Record<string, string | number>;
  } | null;
  onValuesChange: (values: Record<string, string>) => void;
}

const VariableInputForm: React.FC<VariableInputFormProps> = ({
  variables,
  selectedClient,
  onValuesChange,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  
  useEffect(() => {
    if (selectedClient) {
      const updated: Record<string, string> = {};
      variables.forEach((variable) => {
        if (selectedClient.client_data[variable]) {
          updated[variable] = String(selectedClient.client_data[variable]);
        }
      });
      setFormValues((prev) => ({ ...prev, ...updated }));
      onValuesChange({ ...formValues, ...updated });
    }
  }, [selectedClient, variables]);

  
  const handleChange = (variable: string, value: string) => {
    const updated = { ...formValues, [variable]: value };
    setFormValues(updated);
    onValuesChange(updated);
  };

  return (
    <div className="space-y-4">
      {variables.map((variable) => (
        <div key={variable}>
          <label className="block text-sm font-medium mb-1">
            {variable}:
          </label>
          <input
            type="text"
            placeholder={`Enter ${variable}`}
            value={formValues[variable] || ""}
            onChange={(e) => handleChange(variable, e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      ))}
    </div>
  );
};

export default VariableInputForm;
