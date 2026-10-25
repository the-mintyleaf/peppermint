export interface WodaPhotoPerson {
  name: string;
  /** Printed in brackets under the name, e.g. "Applicant's Father". */
  caption: string;
}

export interface WodaPhotoGridProps {
  people: WodaPhotoPerson[];
}
