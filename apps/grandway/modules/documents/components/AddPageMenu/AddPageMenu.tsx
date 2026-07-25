"use client";

import type { ReactNode } from "react";
import { Menu } from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentType } from "../../documents.types";
import {
  getBankMenuInstitutions,
  getLorMenuLabel,
  getLorMenuTypes,
  getMoiMenuLabel,
  getMoiMenuTypes,
  getStudentMenuTypes,
  getWodaMenuLabel,
  getWodaMenuTypes,
} from "../../utils/documentTypeMenu";
import { usesCreateModal } from "../../utils/defaultDocumentContent";

interface AddPageMenuProps {
  children: ReactNode;
  width?: number;
}

export function AddPageMenu({ children, width = 220 }: AddPageMenuProps) {
  const {
    applicantId,
    documents,
    openCreateModal,
    quickCreateDocument,
    createBankPair,
    isCreatingDocument,
  } = useDocumentEditor();

  const studentTypes = getStudentMenuTypes(applicantId, documents);
  const wodaTypes = getWodaMenuTypes(applicantId, documents);
  const lorTypes = getLorMenuTypes(applicantId, documents);
  const moiTypes = getMoiMenuTypes(applicantId, documents);
  const bankInstitutions = getBankMenuInstitutions(applicantId, documents);

  const handleSelect = (type: DocumentType) => {
    if (usesCreateModal(type)) {
      openCreateModal(type);
      return;
    }
    quickCreateDocument(type);
  };

  const hasOptions =
    studentTypes.length > 0 ||
    wodaTypes.length > 0 ||
    lorTypes.length > 0 ||
    moiTypes.length > 0 ||
    bankInstitutions.length > 0;

  if (!hasOptions) {
    return <>{children}</>;
  }

  return (
    <Menu shadow="md" position="bottom-start" width={width} withinPortal>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>New page</Menu.Label>

        {studentTypes.length > 0 && (
          <Menu.Sub openDelay={80} closeDelay={120}>
            <Menu.Sub.Target>
              <Menu.Sub.Item fz="xs">Applicant</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {studentTypes.map((type) => (
                <Menu.Item
                  key={type}
                  fz="xs"
                  onClick={() => handleSelect(type)}
                >
                  {getDocumentTypeConfig(type).label}
                </Menu.Item>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        )}

        {wodaTypes.length > 0 && (
          <Menu.Sub openDelay={80} closeDelay={120}>
            <Menu.Sub.Target>
              <Menu.Sub.Item fz="xs">WODA</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {wodaTypes.map((variant) => (
                <Menu.Item
                  key={variant.slug}
                  fz="xs"
                  onClick={() => handleSelect(variant.slug)}
                >
                  {getWodaMenuLabel(variant.label)}
                </Menu.Item>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        )}

        {lorTypes.length > 0 && (
          <Menu.Sub openDelay={80} closeDelay={120}>
            <Menu.Sub.Target>
              <Menu.Sub.Item fz="xs">LOR</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {lorTypes.map((inst) => (
                <Menu.Item
                  key={inst.slug}
                  fz="xs"
                  onClick={() => handleSelect(inst.slug)}
                >
                  {getLorMenuLabel(inst.label)}
                </Menu.Item>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        )}

        {moiTypes.length > 0 && (
          <Menu.Sub openDelay={80} closeDelay={120}>
            <Menu.Sub.Target>
              <Menu.Sub.Item fz="xs">MOI</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {moiTypes.map((inst) => (
                <Menu.Item
                  key={inst.slug}
                  fz="xs"
                  onClick={() => handleSelect(inst.slug)}
                >
                  {getMoiMenuLabel(inst.label)}
                </Menu.Item>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        )}

        {bankInstitutions.length > 0 && (
          <Menu.Sub openDelay={80} closeDelay={120}>
            <Menu.Sub.Target>
              <Menu.Sub.Item fz="xs">Bank</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {bankInstitutions.map((bank) => (
                <Menu.Item
                  key={bank.slugKey}
                  fz="xs"
                  disabled={isCreatingDocument}
                  onClick={() => createBankPair(bank.slugKey)}
                >
                  {bank.label}
                </Menu.Item>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
