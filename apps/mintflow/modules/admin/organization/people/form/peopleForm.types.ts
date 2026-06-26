import type { CreatePersonPayload } from "../people.types";

export type PeopleFormValues = CreatePersonPayload;

export interface PeopleFormProps {
  initialValues?: Partial<PeopleFormValues>;
  onSubmit: (values: PeopleFormValues) => void;
  isLoading?: boolean;
}
