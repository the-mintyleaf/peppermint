"use client";

import { Fragment } from "react";
import { fullName, kinship, text } from "../wodaFormat";
import type { WodaApplicantIdentityProps } from "./WodaApplicantIdentity.types";

/** "Mr. A and Mrs. B", or whichever half is filled in. */
function couple(first: string, second: string) {
  if (first && second) {
    return (
      <>
        <b>{first}</b> and <b>{second}</b>
      </>
    );
  }
  return <b>{first || second}</b>;
}

/**
 * The identity clause the birth, relationship and family letters share:
 * "applicant Mr. X, holder of Nepali Citizenship Certificate No. …, National
 * Identity Card No. …, Passport No. …, grandson of … and …, son of … and …".
 * Each document number and the grandparents are left out when blank. The
 * caller writes what follows (", a permanent resident of …").
 */
export function WodaApplicantIdentity({
  values,
  withRoleWord,
}: WodaApplicantIdentityProps) {
  const words = kinship(values);
  const numbers = [
    ["Nepali Citizenship Certificate No.", text(values?.applicant_citizenship)],
    ["National Identity Card No.", text(values?.applicant_nid)],
    ["Passport No.", text(values?.applicant_passport)],
  ].filter(([, value]) => value);

  const grandfather = fullName(
    values?.grandfather_honorific,
    values?.grandfather_name,
  );
  const grandmother = fullName(
    values?.grandmother_honorific,
    values?.grandmother_name,
  );
  const father = fullName(
    values?.applicant_father_honorific,
    values?.applicant_father_name,
  );
  const mother = fullName(
    values?.applicant_mother_honorific,
    values?.applicant_mother_name,
  );

  return (
    <>
      {withRoleWord && "applicant "}
      <b>{fullName(values?.applicant_honorific, values?.applicant_name)}</b>
      {numbers.length > 0 && ", holder of "}
      {numbers.map(([label, value], index) => (
        <Fragment key={label}>
          {index > 0 && ", "}
          {label} <b>{value}</b>
        </Fragment>
      ))}
      {(grandfather || grandmother) && (
        <>
          , {words.grandchild} of {couple(grandfather, grandmother)}
        </>
      )}
      {(father || mother) && (
        <>
          , {words.child} of {couple(father, mother)}
        </>
      )}
    </>
  );
}
