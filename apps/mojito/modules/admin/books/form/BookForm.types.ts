import type { Book } from "../books.types";

export interface BookFormProps {
  initialValues?: Book;
  onSubmit: (values: Book) => void;
  isLoading?: boolean;
}
