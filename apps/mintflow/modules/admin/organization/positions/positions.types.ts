import type { PositionStatus, PositionType } from "../organization.types";

export type { PositionStatus, PositionType };

export interface Position extends Record<string, unknown> {
  id: string;
  organization: string;
  unit: string;
  title: string;
  code: string;
  position_type: PositionType;
  status: PositionStatus;
  description: string;
  is_leadership: boolean;
  is_supervisory: boolean;
  is_single_occupant: boolean;
  max_occupants: number;
  effective_from: string | null;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PositionsFetchResponse {
  data: Position[];
  meta: { total: number; page: number; pageSize: number };
}
