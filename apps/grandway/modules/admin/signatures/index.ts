// Public API of the signatory library.
//
// **This module imports nothing from `modules/documents`.** The dependency runs
// the other way: `documents` consumes the signatory domain from here. That
// direction is what makes a cycle impossible, and it is the reverse of what an
// older comment in `documents/utils/` assumed — do not flip it back.

export {
  useActiveSignatories,
  useChangeSignatoryStatus,
  useCreateSignatory,
  useSignatoryList,
  useUpdateSignatory,
  useUploadSignatorySignature,
} from "./signatures.hooks";
export {
  activeSignatoriesKey,
  signatoriesListKey,
  signatoryQueryKeys,
} from "./signatures.queryKeys";
export { fetchSignatories } from "./signatures.api";
export {
  SIGNATORY_STATUS_COLORS,
  SIGNATORY_STATUS_LABELS,
  SIGNATURE_SOURCE_LABELS,
  signatureSourceSuffix,
} from "./signatures.labels";
export type {
  Signatory,
  SignatoryStatus,
  SignatorySource,
  SignatureFile,
} from "./signatures.types";
