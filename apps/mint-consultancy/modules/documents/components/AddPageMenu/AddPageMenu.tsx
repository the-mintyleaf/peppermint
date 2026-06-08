"use client";

import type { ReactNode } from "react";
import { Menu } from "@zetsel/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { DocumentType } from "../../documents.types";
import {
  getBankMenuInstitutions,
  getBankVariantLabel,
  getLorMenuLabel,
  getLorMenuTypes,
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
  const { studentId, documents, openCreateModal, quickCreateDocument } = useDocumentEditor();

  const studentTypes = getStudentMenuTypes(studentId, documents);
  const wodaTypes = getWodaMenuTypes(studentId, documents);
  const lorTypes = getLorMenuTypes(studentId, documents);
  const bankInstitutions = getBankMenuInstitutions(studentId, documents);

  const handleSelect = (type: DocumentType) => {
    if (usesCreateModal(type)) {
      openCreateModal(type);
      return;
    }
    quickCreateDocument(type);
  };

  const hasOptions = studentTypes.length > 0 || wodaTypes.length > 0 || lorTypes.length > 0 || bankInstitutions.length > 0;

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
              <Menu.Sub.Item fz="xs">Student</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {studentTypes.map((type) => (
                <Menu.Item key={type} fz="xs" onClick={() => handleSelect(type)}>
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

        {bankInstitutions.length > 0 && (
          <Menu.Sub openDelay={80} closeDelay={120}>
            <Menu.Sub.Target>
              <Menu.Sub.Item fz="xs">Bank</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              {bankInstitutions.map((bank) => (
                <Menu.Sub key={bank.slugKey} openDelay={80} closeDelay={120}>
                  <Menu.Sub.Target>
                    <Menu.Sub.Item fz="xs">{bank.label}</Menu.Sub.Item>
                  </Menu.Sub.Target>
                  <Menu.Sub.Dropdown>
                    {bank.certificateAvailable && (
                      <Menu.Item
                        fz="xs"
                        onClick={() => handleSelect(bank.certificateType)}
                      >
                        {getBankVariantLabel(bank.certificateType)}
                      </Menu.Item>
                    )}
                    {bank.statementAvailable && (
                      <Menu.Item
                        fz="xs"
                        onClick={() => handleSelect(bank.statementType)}
                      >
                        {getBankVariantLabel(bank.statementType)}
                      </Menu.Item>
                    )}
                  </Menu.Sub.Dropdown>
                </Menu.Sub>
              ))}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
