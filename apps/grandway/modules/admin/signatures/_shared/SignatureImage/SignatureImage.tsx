"use client";

import { Box, Image, Loader, Text } from "@peppermint/ui";
import { useResolvedSignature } from "../useResolvedSignature";
import type { SignatureImageProps } from "./SignatureImage.types";

/**
 * A signatory's signature, from whichever of the two sources is actually in
 * force. All four output states are handled — loading bytes, a failed download,
 * nothing to render, and the image — because a signature that silently renders
 * as a blank box is indistinguishable from one the operator meant to leave
 * empty, and they need to tell those apart before printing.
 */
export function SignatureImage({
  signatory,
  height = 64,
  emptyLabel = "No signature image",
}: SignatureImageProps) {
  const { url, isLoading, isError } = useResolvedSignature(signatory);

  if (isLoading) {
    return (
      <Box h={height} style={{ display: "grid", placeItems: "center" }}>
        <Loader size="xs" aria-label="Loading signature image" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box h={height} style={{ display: "grid", placeItems: "center" }}>
        <Text size="xs" c="red.7">
          Signature image unavailable
        </Text>
      </Box>
    );
  }

  if (!url) {
    return (
      <Box h={height} style={{ display: "grid", placeItems: "center" }}>
        {emptyLabel ? (
          <Text size="xs" c="dimmed">
            {emptyLabel}
          </Text>
        ) : null}
      </Box>
    );
  }

  return (
    <Image
      src={url}
      alt={
        signatory?.name ? `${signatory.name}'s signature` : "Signature image"
      }
      h={height}
      fit="contain"
    />
  );
}
