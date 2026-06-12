import type { TeamMemberRow } from "../team.types";

export interface TeamMemberFormProps {
  initialValues?: Partial<TeamMemberRow>;
  onSubmit: (values: TeamMemberRow) => void;
  isLoading?: boolean;
}
