import { useToast } from 'primevue/usetoast';

export function useAppToast() {
  const toast = useToast();

  const showWarning = (summary: string, detail?: string) => {
    toast.add({
      severity: 'warn',
      summary,
      detail,
      life: 5000
    });
  };

  const showError = (summary: string, detail?: string) => {
    toast.add({
      severity: 'error',
      summary,
      detail,
      life: 6000
    });
  };

  return { showWarning, showError };
}
