"use client";

import {
  useContentItems,
  useDeleteContent,
  useDuplicateContent,
} from "../content/content.hooks";

export function useDrafts(page = 1, pageSize = 20) {
  return useContentItems({ status: "draft", page, pageSize });
}

export {
  useDeleteContent as useDeleteDraft,
  useDuplicateContent as useDuplicateDraft,
};
