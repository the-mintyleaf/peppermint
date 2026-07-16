import { Stack, Center, Text, Container } from "@peppermint/ui";
import type { BankStatementData } from "@/context/DocumentContext";
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { FormHandler } from "@/components/framework/FormHandler";

// Import all bank statement templates
import { TemplateBigyalaxmiStatement } from "./bigyalaxmi/statement";
import { TemplateSumnimaStatement } from "./sumnima/statement";
import { TemplateMataBageshworiStatement } from "./mataBageshwori/statement";
import { TemplateNarayanStatement } from "./narayan/statement";
import { TemplateHimchuliStatement } from "./himchuli/statement";
import { TemplateVyasStatement } from "./vyas/statement";
import { TemplateBirendranagarStatement } from "./birendranagar/statement";
import { TemplateKarnaliStatement } from "./karnali/statement";
import { TemplateJanautthanStatement } from "./janautthan/statement";
import { TemplateTribeniStatement } from "./tribeni/statement";
import { TemplateShahabhagiStatement } from "./shahabhagi/statement";

// Import all bank certificate templates
import { TemplateBigyalaxmiCertificate } from "./bigyalaxmi/certificate";
import { TemplateSumnimaCertificate } from "./sumnima/certificate";
import { TemplateMataBageshworiCertificate } from "./mataBageshwori/certificate";
import { TemplateNarayanCertificate } from "./narayan/certificate";
import { TemplateHimchuliCertificate } from "./himchuli/certificate";
import { TemplateVyasertificate } from "./vyas/certificate";
import { TemplateBirendranagarCertificate } from "./birendranagar/certificate";
import { TemplateKarnaliCertificate } from "./karnali/certificate";
import { TemplateJanautthanCertificate } from "./janautthan/certificate";
import { TemplateTribeniCertificate } from "./tribeni/certificate";
import { TemplateShahabhagiCertificate } from "./shahabhagi/certificate";

const bankStatementMap: Record<string, React.ComponentType<any>> = {
  bigyalaxmi: TemplateBigyalaxmiStatement,
  sumnima: TemplateSumnimaStatement,
  mataBageshwori: TemplateMataBageshworiStatement,
  narayan: TemplateNarayanStatement,
  himchuli: TemplateHimchuliStatement,
  vyas: TemplateVyasStatement,
  birendranagar: TemplateBirendranagarStatement,
  karnali: TemplateKarnaliStatement,
  janautthan: TemplateJanautthanStatement,
  tribeni: TemplateTribeniStatement,
  shahabhagi: TemplateShahabhagiStatement,
};

const bankCertificateMap: Record<string, React.ComponentType<any>> = {
  bigyalaxmi: TemplateBigyalaxmiCertificate,
  sumnima: TemplateSumnimaCertificate,
  mataBageshwori: TemplateMataBageshworiCertificate,
  narayan: TemplateNarayanCertificate,
  himchuli: TemplateHimchuliCertificate,
  vyas: TemplateVyasertificate,
  birendranagar: TemplateBirendranagarCertificate,
  karnali: TemplateKarnaliCertificate,
  janautthan: TemplateJanautthanCertificate,
  tribeni: TemplateTribeniCertificate,
  shahabhagi: TemplateShahabhagiCertificate,
};

export function BankStatementDisplayTemplate({
  data,
  bankKey: propBankKey,
}: {
  data: BankStatementData | null;
  bankKey?: string;
}) {
  // Determine which bank template to render - prefer data (current form value), then fallback to prop (original)
  const bankKey = data?.bank_template || data?.bank || propBankKey;

  console.log("BankStatementDisplayTemplate - propBankKey:", propBankKey);
  console.log(
    "BankStatementDisplayTemplate - data.bank_template:",
    data?.bank_template,
  );
  console.log("BankStatementDisplayTemplate - data.bank:", data?.bank);
  console.log("BankStatementDisplayTemplate - resolved bankKey:", bankKey);
  console.log("BankStatementDisplayTemplate - data:", data);

  if (!bankKey) {
    return (
      <Center py="xl">
        <Text size="sm" c="dimmed">
          Bank information not available
        </Text>
      </Center>
    );
  }

  const StatementComponent = bankStatementMap[bankKey];
  const CertificateComponent = bankCertificateMap[bankKey];

  console.log(
    "BankStatementDisplayTemplate - StatementComponent:",
    StatementComponent,
  );
  console.log(
    "BankStatementDisplayTemplate - CertificateComponent:",
    CertificateComponent,
  );

  if (!StatementComponent || !CertificateComponent) {
    return (
      <Center py="xl">
        <Text size="sm" c="dimmed">
          Template not available for {bankKey}
        </Text>
      </Center>
    );
  }

  // Render the bank-specific statement and certificate templates with context providers
  // Similar to WodaDocumentDisplayTemplate, use Container and Stack for layout
  return (
    <ContextEditor.Provider>
      <FormHandler.Provider values={data || {}}>
        <Container size="8.3in" px={{ base: "xs", lg: 0 }} my="md">
          <Stack gap={4}>
            {/* Bank Certificate */}
            <div key={`cert-${bankKey}`}>
              <CertificateComponent />
            </div>

            {/* Bank Statement */}
            <div key={`stmt-${bankKey}`}>
              <StatementComponent />
            </div>
          </Stack>
        </Container>
      </FormHandler.Provider>
    </ContextEditor.Provider>
  );
}
