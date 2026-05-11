import type { ZodSchema } from 'zod';
import type { ApiResponse } from '@zetsel/api-client';
import type { FormValues } from '../../wrappers/FormWrapper';
import type { ModuleInfo } from '../../wrappers/DataTableWrapper';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FormShellProps<T extends FormValues> {
  title: string;
  moduleInfo?: ModuleInfo;
  bread?: BreadcrumbItem[];

  initial: T;
  apiSubmitFn: (data: T) => Promise<ApiResponse<unknown>>;
  validation?: ZodSchema[];
  transformFnSubmit?: (data: T) => T;
  submitSuccessFn?: () => void;
  hasDirtCheck?: boolean;
  formClearOnSuccess?: boolean;

  steps?: string[];
  showStepper?: boolean;
  disabledSteps?: number[];
  enableStepClick?: boolean;

  onCancel?: () => void;
  children: React.ReactNode;
}
