import React from 'react';

interface PercentInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function PercentInput({ 
  value, 
  onChange, 
  placeholder = "%", 
  className = "",
  disabled = false,
  id
}: PercentInputProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      id={id}
      value={value ?? ""}
      onChange={(e) => {
        const s = e.target.value;
        if (s.trim() === "") { 
          onChange(null); 
          return; 
        }
        const n = Number(s.replace("%", ""));
        onChange(Number.isFinite(n) ? n : null);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
    />
  );
}

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  step?: string;
  id?: string;
}

export function NumberInput({ 
  value, 
  onChange, 
  placeholder = "", 
  className = "",
  disabled = false,
  step = "0.1",
  id
}: NumberInputProps) {
  return (
    <input
      type="number"
      step={step}
      id={id}
      value={value ?? ""}
      onChange={(e) => {
        const s = e.target.value;
        if (s.trim() === "") { 
          onChange(null); 
          return; 
        }
        const n = Number(s);
        onChange(Number.isFinite(n) ? n : null);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
    />
  );
}

interface TextInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function TextInput({ 
  value, 
  onChange, 
  placeholder = "", 
  className = "",
  disabled = false,
  id
}: TextInputProps) {
  return (
    <input
      type="text"
      id={id}
      value={value ?? ""}
      onChange={(e) => {
        const s = e.target.value;
        onChange(s.trim() === "" ? null : s);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
    />
  );
}
