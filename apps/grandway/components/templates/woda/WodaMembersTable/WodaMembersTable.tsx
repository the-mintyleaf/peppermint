"use client";

import { Space, Text } from "@peppermint/ui";
import { wodaTextProps } from "../wodaProps";
import { relationshipMembers } from "../wodaFormat";
import { WodaTable } from "../WodaTable";
import { WodaPhotoGrid } from "../WodaPhotoGrid";
import type { WodaMembersTableProps } from "./WodaMembersTable.types";

/**
 * The relationship letters' body: one row per certified person (name,
 * citizenship number, relation to the applicant), then a photo space for each.
 */
export function WodaMembersTable({ values }: WodaMembersTableProps) {
  const members = relationshipMembers(values);

  return (
    <>
      <WodaTable>
        <thead>
          <tr>
            <th style={{ width: "0.55in" }}>S. N.</th>
            <th>Name</th>
            <th style={{ width: "1.9in" }}>Citizenship Certificate Number</th>
            <th style={{ width: "2.1in" }}>Relationship with the Applicant</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={`${member.name}-${index}`}>
              <td style={{ textAlign: "center" }}>{index + 1}.</td>
              <td>{member.name}</td>
              <td style={{ textAlign: "center" }}>{member.citizenship}</td>
              <td>{member.relation}</td>
            </tr>
          ))}
        </tbody>
      </WodaTable>

      <Space h=".2in" />
      <Text {...wodaTextProps} td="underline">
        Photo Verification:
      </Text>
      <Space h=".15in" />
      <WodaPhotoGrid
        people={members.map((m) => ({ name: m.name, caption: m.relation }))}
      />
    </>
  );
}
