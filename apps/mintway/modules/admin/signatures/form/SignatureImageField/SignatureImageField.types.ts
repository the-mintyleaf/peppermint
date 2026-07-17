export interface SignatureImageFieldProps {
  disabled?: boolean;
  /** Existing image object URL when editing (empty/undefined when none is loaded). */
  existingImageUrl?: string;
  /** True when the record has an image on file even if its blob isn't loaded into the list. */
  hasExistingImage: boolean;
}
