export interface DistributionDatum {
  key: string;
  label: string;
  /** Mantine colour name — the status's own colour, from its owning module. */
  color: string;
  value: number;
}

export interface DistributionBarProps {
  heading: string;
  data: DistributionDatum[];
}
