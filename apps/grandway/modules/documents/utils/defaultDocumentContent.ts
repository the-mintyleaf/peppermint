import type {
  BankContent,
  CertificateContent,
  CvContent,
  DocumentContent,
  DocumentType,
  LorContent,
  MoiContent,
  WodaContent,
} from "../documents.types";
import {
  LOR_INSTITUTIONS,
  MOI_INSTITUTIONS,
  WODA_VARIANTS,
} from "../documentTypeDefinitions";

const wodaBaseDefaults: WodaContent = {
  wodadoc_refno: "",
  wodadoc_date: new Date().toISOString().split("T")[0],
  applicant_name: "",
  applicant_honorific: "Mr.",
  applicant_gender: "Male",
  spokesperson_name: "",
  spokesperson_post: "",
  spokesperson_contact: "",
};

const wodaVariantDefaults: Partial<
  Record<DocumentType, Record<string, unknown>>
> = {
  "woda-agriculture-income": {
    land_plot_numbers: "",
    landowner_honorific: "Mr.",
    landowner_name: "",
    landowner_relationship: "",
    land_location: "",
    crops: "",
    annual_income_nrs: 0,
    annual_income_words: "",
  },
  "woda-affidavit-financial": {
    dispatch_no: "",
    wodadoc_date_bs: "",
    sponsor_honorific: "Mr.",
    sponsor_name: "",
    sponsor_relation: "Grandfather",
    sponsor_citizenship_no: "",
    father_honorific: "Mr.",
    father_name: "",
    mother_honorific: "Mrs.",
    mother_name: "",
    parent_citizenship_no: "",
    permanent_address: "",
    student_honorific: "Miss",
    student_name: "",
    student_pronoun: "her",
    student_kinship: "daughter",
    student_citizenship_no: "",
    student_nid_no: "",
    student_passport_no: "",
    course_level: "Bachelor",
    course_name: "",
    institution_name: "",
    institution_location: "",
    support_providers: "",
    signer1_name: "",
    signer1_relation: "Grandmother",
    signer2_name: "",
    signer2_relation: "Father",
    signer3_name: "",
    signer3_relation: "Mother",
    chairman_name: "",
    chairman_date: "",
  },
  "woda-address": {
    applicant_father_name: "",
    applicant_father_honorific: "",
    applicant_mother_name: "",
    applicant_mother_honorific: "",
    initial_address_name: "",
    applicant_permanent_address: "",
    address_name_change_date_bs: "",
    address_name_change_date: "",
  },
};

const lorBaseDefaults: LorContent = {
  lor_ref_no: "",
  lor_letter_no: "",
  lor_date: new Date().toISOString().split("T")[0],
  institution_name: "",
  institution_subname: "",
  institution_address: "",
  lor_title: "LETTER OF RECOMMENDATION",
  lor_salutation: "Dear sir,",
  student_honorific: "Mr.",
  student_name: "",
  para_1: "",
  para_2: "",
  para_3: "",
  para_4: "",
  recommender_honorific: "",
  recommender_name: "",
  recommender_title: "",
  recommender_dept: "",
  recommender_contact: "",
  recommender_email: "",
};

const lorInstitutionDefaults: Partial<
  Record<DocumentType, Partial<LorContent>>
> = {
  "lor-janajagriti": {
    institution_name: "Shree Janajagriti Secondary School",
    institution_address: "Tamakoshi R.M., Ward No. 5, Shahare, Dolakha",
    lor_title: "LETTER OF RECOMMENDATION",
    recommender_title: "Head Teacher",
  },
  "lor-bageshwari-chief": {
    institution_name: "Bageshwari Multiple Campus",
    institution_subname: "Mid-West University",
    institution_address: "Kohalpur, Banke",
    lor_title: "Letter of Recommendation",
    recommender_title: "Campus Chief",
    recommender_contact: "081540076",
    recommender_email: "bmck@mwu.edu.np",
  },
  "lor-bageshwari-hod": {
    institution_name: "Bageshwari Multiple Campus",
    institution_subname: "Mid-West University",
    institution_address: "Kohalpur, Banke",
    lor_title: "To Whom It May Concern",
    lor_salutation: "",
    recommender_title: "Head of Faculty",
    recommender_email: "bmck@mwu.edu.np",
  },
  "lor-shiva": {
    institution_name: "Shree Shiva Secondary School",
    institution_address: "Chure-1, Kimtola, Kailali",
    lor_title: "Recommendation Letter",
    recommender_title: "Principal",
  },
  "lor-kcmit": {
    institution_name: "Kantipur College of Management & Information Technology",
    institution_address:
      "Post Box No. 19344, Basuki Marg, Old Baneshwor, Kathmandu, Nepal",
    lor_title: "TO WHOM IT MAY CONCERN",
    lor_salutation: "",
    recommender_contact: "4479939",
    recommender_email: "kcmitcollege@gmail.com",
  },
  "lor-tri-chandra": {
    institution_name: "Tri-Chandra Multiple Campus",
    institution_subname: "Tribhuvan University",
    institution_address: "Saraswati Sadan, Kathmandu, Nepal",
    lor_title: "RECOMMENDATION LETTER",
    recommender_contact: "4-244047",
  },
  "lor-monastic": {
    institution_name: "Monastic Secondary English Boarding School",
    institution_address:
      "Mills Area (Sr.), Bhanu Chowk (Jr.), Janakpurdham, Dhanusha, Nepal",
    lor_title: "To Whom It May Concern",
    lor_salutation: "",
    recommender_contact: "+977-041-590291",
    recommender_email: "admin@monastic.edu.np",
  },
  "lor-om-health": {
    institution_name: "Om Health Campus (P.) Ltd.",
    institution_subname:
      "A Sister Organization of Om Hospital & Research Centre (P.) Ltd.",
    institution_address: "Gopi Krishna Nagar, Chabahil, Kathmandu, Nepal",
    lor_title: "TO WHOM IT MAY CONCERN",
    lor_salutation: "",
    recommender_title: "Act. Principal",
    recommender_contact: "9841412676",
    recommender_email: "iswarikhanal78@gmail.com",
  },
  "lor-atlantic": {
    institution_name: "Atlantic International College",
    institution_subname: "Affiliated to Pokhara University",
    institution_address: "Galkopakha, Thamel, Kathmandu",
    lor_title: "To Whom It May Concern",
    lor_salutation: "",
    recommender_title: "Principal",
    recommender_contact: "+977-1-4022514",
    recommender_email: "info@atlantic.edu.np",
  },
  "lor-model-technical": {
    institution_name: "Model College of Technical Education Pvt.Ltd.",
    institution_subname: "Affiliated with CTEVT",
    institution_address: "Chhapkaiya-2, Birgunj",
    lor_title: "LETTER OF RECOMMENDATION",
    recommender_title: "Principal",
    recommender_contact: "051-525412, 525908",
  },
  "lor-nepalgunj": {
    institution_name: "Nepalgunj Technical College",
    institution_address: "Nepalgunj, Banke",
    lor_title: "To Whom It May Concern",
    recommender_title: "Principal",
    recommender_contact: "081-5363930, 081-5837940",
    recommender_email: "ntc.college08@gmail.com",
  },
};

const moiBaseDefaults: MoiContent = {
  moi_ref_no: "",
  moi_letter_no: "",
  moi_date: new Date().toISOString().split("T")[0],
  institution_name: "",
  institution_address: "",
  student_honorific: "Mr.",
  student_name: "",
  student_last_name: "",
  student_pronoun: "him",
  signatory_name: "",
  signatory_contact: "",
  signatory_email: "",
};

const moiInstitutionDefaults: Partial<
  Record<DocumentType, Partial<MoiContent>>
> = {
  "moi-global-college": {
    institution_name: "Global College of Management",
    institution_address: "Baneshwor, Kathmandu-31, Nepal",
    signatory_email: "ambadatt.joshi@globalcollege.edu.np",
  },
  "moi-janajagriti": {
    institution_name: "Shree Janajagriti Secondary School",
    institution_address: "Tamakoshi R.M., Ward No. 5, Shahare, Dolakha",
  },
  "moi-vinayak": {
    institution_name: "Vinayak Health Care System",
    institution_address:
      "P.O. Box: 23, Bharatpur-10, Chitwan, Bagmati Province, Nepal",
  },
  "moi-reliance": {
    institution_name: "Reliance International Academy",
    institution_address: "Saraswati Nagar, Ghabahil, Kathmandu, Nepal",
  },
  "moi-bheri-nursing": {
    institution_name: "Bheri Nursing College",
    institution_address: "Belaspur-12, Nepalgunj, Banke",
    signatory_contact: "081-415339",
  },
};

const bankBaseDefaults = (slugKey: string): BankContent => ({
  statement_account_holder: "",
  statement_account_no: "",
  statement_account_address: "",
  statement_account_type: "",
  statement_start_date: "",
  statement_end_date: new Date().toISOString().split("T")[0],
  statement_opening_date: "",
  statement_ref_no: "",
  statement_interest: "5", // annual interest rate %
  statement_tax: "5", // tax rate % on interest
  statement_opening_balance: 0,
  transactions: [], // running balances, totals, interest & tax are derived — see computeBankStatement
  details: {},
  bank: slugKey,
  bank_template: "",
});

export function getDefaultDocumentContent(type: DocumentType): DocumentContent {
  if (type === "student-certificate") {
    const today = new Date().toISOString().split("T")[0];
    return {
      issue: today,
      issueDate: today,
      studyType: 0,
      instructorId: null,
      directorId: null,
      studentName: "",
      program: "",
      nationality: "",
    } satisfies CertificateContent;
  }

  if (type === "student-cv") {
    return { summary: "", skills: "", experience: "" } satisfies CvContent;
  }

  if (type === "student-cv-standard") {
    return {
      nationality: "Nepali",
      languages_known: "Nepali, English",
      passport_number: "",
      passport_issue_date: "",
      passport_expiry_date: "",
      ielts_overall: "",
      ielts_date: "",
      ielts_listening: "",
      ielts_reading: "",
      ielts_writing: "",
      ielts_speaking: "",
      skills: "",
    } satisfies CvContent;
  }

  if (type === "student-cv-extended") {
    return {
      nationality: "Nepali",
      languages_known: "Nepali, English",
      religion: "",
      alternate_email: "",
      passport_number: "",
      skills: "",
      courses_training: "",
      ref1_name: "",
      ref1_title: "",
      ref1_institution: "",
      ref1_address: "",
      ref1_email: "",
      ref1_contact: "",
      ref2_name: "",
      ref2_title: "",
      ref2_institution: "",
      ref2_address: "",
      ref2_email: "",
      ref2_contact: "",
    } satisfies CvContent;
  }

  if (type === "student-cv-europass") {
    return {
      nationality: "Nepali",
      place_of_birth: "",
      summary: "",
      skills: "",
      passport_number: "",
      mother_tongue: "",
      languages: [
        {
          language: "",
          listening: "",
          reading: "",
          spoken_production: "",
          spoken_interaction: "",
          writing: "",
        },
      ],
      appearance: { headerColor: "#f3f3f3", fontFamily: "sans" },
    } satisfies CvContent;
  }

  const lorVariant = LOR_INSTITUTIONS.find((l) => l.slug === type);
  if (lorVariant) {
    return {
      ...lorBaseDefaults,
      ...(lorInstitutionDefaults[type] ?? {}),
    };
  }

  const moiVariant = MOI_INSTITUTIONS.find((m) => m.slug === type);
  if (moiVariant) {
    return {
      ...moiBaseDefaults,
      ...(moiInstitutionDefaults[type] ?? {}),
    };
  }

  const wodaVariant = WODA_VARIANTS.find((v) => v.slug === type);
  if (wodaVariant) {
    return {
      ...wodaBaseDefaults,
      ...(wodaVariantDefaults[type] ?? {}),
    };
  }

  const bankMatch = type.match(/^bank-(.+)-(certificate|statement)$/);
  if (bankMatch) {
    const [, slugKey, variant] = bankMatch;
    const base = { ...bankBaseDefaults(slugKey), bank_template: variant };
    if (variant === "certificate") {
      return {
        ...base,
        statement_total_balance: 0,
        statement_usdrate: 133, // NPR per USD — the balance-in-words is derived
        statement_spokesperson: "",
        statement_spokesperson_post: "",
      };
    }
    return base;
  }

  return {};
}

export function usesCreateModal(type: DocumentType): boolean {
  return (
    type === "student-certificate" ||
    type === "student-cv" ||
    type === "student-cv-standard" ||
    type === "student-cv-extended" ||
    type === "student-cv-europass"
  );
}
