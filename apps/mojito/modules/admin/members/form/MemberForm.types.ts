import type { Member } from "../members.types";

export interface MemberFormProps {
  initialValues?: Member;
  onSubmit: (values: Member) => void;
  isLoading?: boolean;
}
