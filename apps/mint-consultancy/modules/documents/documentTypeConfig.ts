import type { DocumentType, DocumentTypeConfig } from "./documents.types";
import { WODA_VARIANTS, BANK_INSTITUTIONS, LOR_INSTITUTIONS } from "./documentTypeDefinitions";
import {
  CertificateForm,
  CertificateTemplate,
  CertificateConfigBar,
} from "./document-types/student-certificate";
import { CvForm, CvTemplate } from "./document-types/student-cv";
import { WodaAddressForm, WodaAddressTemplate } from "./document-types/woda-address";
import { WodaDobForm, WodaDobTemplate } from "./document-types/woda-dob";
import { WodaFiscalForm, WodaFiscalTemplate } from "./document-types/woda-fiscal";
import { WodaIncomeForm, WodaIncomeTemplate } from "./document-types/woda-income";
import { WodaMigrationForm, WodaMigrationTemplate } from "./document-types/woda-migration";
import { WodaOccupationForm, WodaOccupationTemplate } from "./document-types/woda-occupation";
import { WodaRelationshipForm, WodaRelationshipTemplate } from "./document-types/woda-relationship";
import { WodaSurnameForm, WodaSurnameTemplate } from "./document-types/woda-surname";
import { WodaTaxClearanceForm, WodaTaxClearanceTemplate } from "./document-types/woda-tax-clearance";
import { WodaAgricultureIncomeForm, WodaAgricultureIncomeTemplate } from "./document-types/woda-agriculture-income";
import {
  LorJanajagriti,
  LorBageshwariChief,
  LorBageshwariHod,
  LorShiva,
  LorKcmit,
  LorTriChandra,
  LorMonastic,
  LorOmHealth,
  LorAtlantic,
  LorModelTechnical,
  LorNepalgunj,
  LorTemplate,
} from "./document-types/lor";
import {
  BigyalaxmiCertificateForm,
  BigyalaxmiCertificateTemplate,
} from "./document-types/bank-bigyalaxmi-certificate";
import {
  BigyalaxmiStatementForm,
  BigyalaxmiStatementTemplate,
} from "./document-types/bank-bigyalaxmi-statement";
import {
  BirendranagarCertificateForm,
  BirendranagarCertificateTemplate,
} from "./document-types/bank-birendranagar-certificate";
import {
  BirendranagarStatementForm,
  BirendranagarStatementTemplate,
} from "./document-types/bank-birendranagar-statement";
import {
  HimchuliCertificateForm,
  HimchuliCertificateTemplate,
} from "./document-types/bank-himchuli-certificate";
import {
  HimchuliStatementForm,
  HimchuliStatementTemplate,
} from "./document-types/bank-himchuli-statement";
import {
  JanautthanCertificateForm,
  JanautthanCertificateTemplate,
} from "./document-types/bank-janautthan-certificate";
import {
  JanautthanStatementForm,
  JanautthanStatementTemplate,
} from "./document-types/bank-janautthan-statement";
import {
  KarnaliCertificateForm,
  KarnaliCertificateTemplate,
} from "./document-types/bank-karnali-certificate";
import {
  KarnaliStatementForm,
  KarnaliStatementTemplate,
} from "./document-types/bank-karnali-statement";
import {
  MataBageshworiCertificateForm,
  MataBageshworiCertificateTemplate,
} from "./document-types/bank-mata-bageshwori-certificate";
import {
  MataBageshworiStatementForm,
  MataBageshworiStatementTemplate,
} from "./document-types/bank-mata-bageshwori-statement";
import {
  NarayanCertificateForm,
  NarayanCertificateTemplate,
} from "./document-types/bank-narayan-certificate";
import {
  NarayanStatementForm,
  NarayanStatementTemplate,
} from "./document-types/bank-narayan-statement";
import {
  ShahabhagiCertificateForm,
  ShahabhagiCertificateTemplate,
} from "./document-types/bank-shahabhagi-certificate";
import {
  ShahabhagiStatementForm,
  ShahabhagiStatementTemplate,
} from "./document-types/bank-shahabhagi-statement";
import {
  SumnimaCertificateForm,
  SumnimaCertificateTemplate,
} from "./document-types/bank-sumnima-certificate";
import {
  SumnimaStatementForm,
  SumnimaStatementTemplate,
} from "./document-types/bank-sumnima-statement";
import {
  TribeniCertificateForm,
  TribeniCertificateTemplate,
} from "./document-types/bank-tribeni-certificate";
import {
  TribeniStatementForm,
  TribeniStatementTemplate,
} from "./document-types/bank-tribeni-statement";
import {
  VyasCertificateForm,
  VyasCertificateTemplate,
} from "./document-types/bank-vyas-certificate";
import { VyasStatementForm, VyasStatementTemplate } from "./document-types/bank-vyas-statement";

const wodaComponents = {
  "woda-address": { Form: WodaAddressForm, Template: WodaAddressTemplate },
  "woda-dob": { Form: WodaDobForm, Template: WodaDobTemplate },
  "woda-fiscal": { Form: WodaFiscalForm, Template: WodaFiscalTemplate },
  "woda-income": { Form: WodaIncomeForm, Template: WodaIncomeTemplate },
  "woda-migration": { Form: WodaMigrationForm, Template: WodaMigrationTemplate },
  "woda-occupation": { Form: WodaOccupationForm, Template: WodaOccupationTemplate },
  "woda-relationship": { Form: WodaRelationshipForm, Template: WodaRelationshipTemplate },
  "woda-surname": { Form: WodaSurnameForm, Template: WodaSurnameTemplate },
  "woda-tax-clearance": { Form: WodaTaxClearanceForm, Template: WodaTaxClearanceTemplate },
  "woda-agriculture-income": { Form: WodaAgricultureIncomeForm, Template: WodaAgricultureIncomeTemplate },
} as const;

const bankCertificateComponents = {
  bigyalaxmi: { Form: BigyalaxmiCertificateForm, Template: BigyalaxmiCertificateTemplate },
  birendranagar: { Form: BirendranagarCertificateForm, Template: BirendranagarCertificateTemplate },
  himchuli: { Form: HimchuliCertificateForm, Template: HimchuliCertificateTemplate },
  janautthan: { Form: JanautthanCertificateForm, Template: JanautthanCertificateTemplate },
  karnali: { Form: KarnaliCertificateForm, Template: KarnaliCertificateTemplate },
  "mata-bageshwori": {
    Form: MataBageshworiCertificateForm,
    Template: MataBageshworiCertificateTemplate,
  },
  narayan: { Form: NarayanCertificateForm, Template: NarayanCertificateTemplate },
  shahabhagi: { Form: ShahabhagiCertificateForm, Template: ShahabhagiCertificateTemplate },
  sumnima: { Form: SumnimaCertificateForm, Template: SumnimaCertificateTemplate },
  tribeni: { Form: TribeniCertificateForm, Template: TribeniCertificateTemplate },
  vyas: { Form: VyasCertificateForm, Template: VyasCertificateTemplate },
} as const;

const bankStatementComponents = {
  bigyalaxmi: { Form: BigyalaxmiStatementForm, Template: BigyalaxmiStatementTemplate },
  birendranagar: { Form: BirendranagarStatementForm, Template: BirendranagarStatementTemplate },
  himchuli: { Form: HimchuliStatementForm, Template: HimchuliStatementTemplate },
  janautthan: { Form: JanautthanStatementForm, Template: JanautthanStatementTemplate },
  karnali: { Form: KarnaliStatementForm, Template: KarnaliStatementTemplate },
  "mata-bageshwori": { Form: MataBageshworiStatementForm, Template: MataBageshworiStatementTemplate },
  narayan: { Form: NarayanStatementForm, Template: NarayanStatementTemplate },
  shahabhagi: { Form: ShahabhagiStatementForm, Template: ShahabhagiStatementTemplate },
  sumnima: { Form: SumnimaStatementForm, Template: SumnimaStatementTemplate },
  tribeni: { Form: TribeniStatementForm, Template: TribeniStatementTemplate },
  vyas: { Form: VyasStatementForm, Template: VyasStatementTemplate },
} as const;

const lorFormMap = {
  "lor-janajagriti": LorJanajagriti,
  "lor-bageshwari-chief": LorBageshwariChief,
  "lor-bageshwari-hod": LorBageshwariHod,
  "lor-shiva": LorShiva,
  "lor-kcmit": LorKcmit,
  "lor-tri-chandra": LorTriChandra,
  "lor-monastic": LorMonastic,
  "lor-om-health": LorOmHealth,
  "lor-atlantic": LorAtlantic,
  "lor-model-technical": LorModelTechnical,
  "lor-nepalgunj": LorNepalgunj,
};

const lorRegistry = Object.fromEntries(
  LOR_INSTITUTIONS.map((inst) => [
    inst.slug,
    {
      type: inst.slug,
      label: inst.label,
      uniquePerStudent: false,
      requiresStudent: false,
      Form: lorFormMap[inst.slug],
      Template: LorTemplate,
    },
  ])
) as Record<(typeof LOR_INSTITUTIONS)[number]["slug"], DocumentTypeConfig>;

const wodaRegistry = Object.fromEntries(
  WODA_VARIANTS.map((variant) => [
    variant.slug,
    {
      type: variant.slug,
      label: variant.label,
      uniquePerStudent: false,
      requiresStudent: false,
      Form: wodaComponents[variant.slug].Form,
      Template: wodaComponents[variant.slug].Template,
    },
  ])
) as Record<(typeof WODA_VARIANTS)[number]["slug"], DocumentTypeConfig>;

const bankRegistry = Object.fromEntries(
  BANK_INSTITUTIONS.flatMap((bank) => {
    const certComponents = bankCertificateComponents[bank.slugKey];
    const stmtComponents = bankStatementComponents[bank.slugKey];

    if (!certComponents || !stmtComponents) {
      console.error(
        `Bank "${bank.label}" (${bank.slugKey}) is missing form/template components. ` +
        `Please add entries to bankCertificateComponents and bankStatementComponents.`
      );
      return [];
    }

    const certificateSlug = `bank-${bank.slugKey}-certificate` as const;
    const statementSlug = `bank-${bank.slugKey}-statement` as const;

    return [
      [
        certificateSlug,
        {
          type: certificateSlug,
          label: `${bank.label} Certificate`,
          uniquePerStudent: false,
          requiresStudent: false,
          Form: certComponents.Form,
          Template: certComponents.Template,
        },
      ],
      [
        statementSlug,
        {
          type: statementSlug,
          label: `${bank.label} Statement`,
          uniquePerStudent: false,
          requiresStudent: false,
          Form: stmtComponents.Form,
          Template: stmtComponents.Template,
        },
      ],
    ];
  })
) as Record<
  | `bank-${(typeof BANK_INSTITUTIONS)[number]["slugKey"]}-certificate`
  | `bank-${(typeof BANK_INSTITUTIONS)[number]["slugKey"]}-statement`,
  DocumentTypeConfig
>;

export const documentTypeRegistry: Record<DocumentType, DocumentTypeConfig> = {
  "student-certificate": {
    type: "student-certificate",
    label: "Certificate",
    uniquePerStudent: true,
    requiresStudent: true,
    Form: CertificateForm,
    Template: CertificateTemplate,
    ConfigBar: CertificateConfigBar,
  },
  "student-cv": {
    type: "student-cv",
    label: "CV",
    uniquePerStudent: true,
    requiresStudent: true,
    Form: CvForm,
    Template: CvTemplate,
  },
  ...wodaRegistry,
  ...lorRegistry,
  ...bankRegistry,
};

export const documentTypeList = Object.values(documentTypeRegistry);

export function getDocumentTypeConfig(type: DocumentType): DocumentTypeConfig {
  return documentTypeRegistry[type];
}

export function getDefaultLabel(type: DocumentType): string {
  return documentTypeRegistry[type].label;
}
