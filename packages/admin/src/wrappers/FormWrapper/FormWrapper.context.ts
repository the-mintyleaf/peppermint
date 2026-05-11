import { createContext } from 'react';
import type { FormInstanceContextValue, FormControlsContextValue, FormValues } from './FormWrapper.types';

// Stable for the lifetime of the form — set once at mount, never re-provides
export const FormInstanceContext = createContext<FormInstanceContextValue<FormValues> | null>(null);

// Changes on step navigation and submission only
export const FormControlsContext = createContext<FormControlsContextValue | null>(null);
