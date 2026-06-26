export interface EffectiveDateRangeValue {
  from: string | null;
  to: string | null;
}

export interface EffectiveDateRangeProps {
  value: EffectiveDateRangeValue;
  onChange: (value: EffectiveDateRangeValue) => void;
  fromLabel?: string;
  toLabel?: string;
  fromError?: string;
  toError?: string;
  fromRequired?: boolean;
  disabled?: boolean;
}
