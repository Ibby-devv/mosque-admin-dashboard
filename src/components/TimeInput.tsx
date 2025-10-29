import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #e5e7eb;
  }
`;

/**
 * Convert 12-hour format (e.g., "2:30 PM") to 24-hour format (e.g., "14:30")
 */
export function convert12To24(time12: string): string {
  if (!time12) return '';
  
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Convert 24-hour format (e.g., "14:30") to 12-hour format (e.g., "2:30 PM")
 */
export function convert24To12(time24: string): string {
  if (!time24) return '';
  
  const match = time24.match(/^(\d{2}):(\d{2})$/);
  if (!match) return '';
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  
  return `${hours}:${minutes} ${period}`;
}

interface TimeInputProps {
  value: string; // 12-hour format (e.g., "2:30 PM")
  onChange: (value: string) => void; // Returns 12-hour format
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

/**
 * TimeInput component that uses native HTML5 time picker (24-hour)
 * but stores/displays values in 12-hour format for consistency
 */
export default function TimeInput({ 
  value, 
  onChange, 
  disabled = false,
  placeholder,
  required = false
}: TimeInputProps): React.JSX.Element {
  // Convert stored 12-hour value to 24-hour for the input
  const value24 = convert12To24(value);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time24 = e.target.value;
    if (time24) {
      // Convert back to 12-hour format for storage
      const time12 = convert24To12(time24);
      onChange(time12);
    } else {
      onChange('');
    }
  };
  
  return (
    <StyledInput
      type="time"
      value={value24}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
    />
  );
}
