import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export function useFormAutoSave<T>(
  form: UseFormReturn<T>,
  key: string,
  delay: number = 1000
) {
  const saveToStorage = useCallback(() => {
    const values = form.getValues();
    localStorage.setItem(key, JSON.stringify(values));
  }, [form, key]);

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        form.reset(data);
        return true;
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
    return false;
  }, [form, key]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(saveToStorage, delay);
      return () => clearTimeout(timeoutId);
    });

    return subscription.unsubscribe;
  }, [form, saveToStorage, delay]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = form.formState.isDirty;
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage
  };
}