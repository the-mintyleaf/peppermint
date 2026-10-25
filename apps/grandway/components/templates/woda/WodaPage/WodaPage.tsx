"use client";

import { useContext } from "react";
import { Paper, Space } from "@peppermint/ui";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { FormHandler } from "@/components/framework/FormHandler";
import { configPageProps } from "../../templateprops";
import { WodaReferenceHeader } from "../WodaReferenceHeader";
import type { WodaPageProps } from "./WodaPage.types";
import classes from "./WodaPage.module.css";

/**
 * One printed WODA letter: the A4 sheet, the gap the pre-printed ward letterhead
 * occupies, and the optional reference/dispatch lines beneath it.
 */
export function WodaPage({ children }: WodaPageProps) {
  const form = FormHandler.useForm();
  const { state } = useContext(ContextEditor.Context);

  return (
    <Paper radius={0} p=".6in" className={classes.root} {...configPageProps}>
      <Space h={`${state.headerProps.height}in`} />
      <WodaReferenceHeader values={form.values} />
      {children}
    </Paper>
  );
}
