import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Person } from "../people.types";
import { PeopleForm } from "./PeopleForm";
import type { PeopleFormValues } from "./peopleForm.types";

export function PeopleCreateForm({
  onSubmit,
  isLoading,
}: ModalFormComponentProps<Person>) {
  return (
    <PeopleForm
      onSubmit={(values: PeopleFormValues) =>
        onSubmit(values as unknown as Person)
      }
      isLoading={isLoading}
    />
  );
}

export { PeopleForm } from "./PeopleForm";
export type { PeopleFormProps, PeopleFormValues } from "./peopleForm.types";
