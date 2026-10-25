"use client";

import type { WodaTableProps } from "./WodaTable.types";
import classes from "./WodaTable.module.css";

/** The ruled black table the WODA letters print their rows in. */
export function WodaTable({ children }: WodaTableProps) {
  return <table className={classes.table}>{children}</table>;
}
