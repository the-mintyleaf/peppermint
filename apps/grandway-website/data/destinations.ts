export type Destination = {
  slug: string;
  name: string;
  eyebrow: string;
  image: string;
  summary: string;
  introduction: string;
  reasons: string[];
  steps: { title: string; description: string }[];
  documents: string[];
  opportunities: string;
};

export const destinations: Destination[] = [
  {
    slug: "australia",
    name: "Australia",
    eyebrow: "A future in focus",
    image:
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=2200&q=85",
    summary:
      "World-class learning, a welcoming student community and a remarkable lifestyle.",
    introduction:
      "Australia offers a wide range of institutions, courses and lively student cities. We help you find the right fit, prepare a clear application and approach your visa process with confidence.",
    reasons: [
      "Internationally recognised universities",
      "Strong student support and multicultural communities",
      "Broad course choices and graduate pathways",
    ],
    steps: [
      {
        title: "Choose your course",
        description:
          "Explore institutions and programs that match your interests, budget and long-term goals.",
      },
      {
        title: "Check your eligibility",
        description:
          "Review offer requirements, financial capacity, English proficiency and health cover.",
      },
      {
        title: "Prepare your application",
        description:
          "Gather academic records, financial evidence and supporting documents with our guidance.",
      },
      {
        title: "Apply with confidence",
        description:
          "Complete your student visa application and prepare carefully for any interview.",
      },
    ],
    documents: [
      "Passport",
      "Offer letter / Confirmation of Enrolment",
      "Academic certificates and transcripts",
      "English test result",
      "Financial documents",
      "Overseas Student Health Cover",
    ],
    opportunities:
      "International students may be able to work within their visa conditions while studying and explore graduate opportunities after completing an eligible qualification.",
  },
  {
    slug: "canada",
    name: "Canada",
    eyebrow: "Learn in a welcoming world",
    image:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=2200&q=85",
    summary:
      "A respected education system, diverse communities and meaningful post-study possibilities.",
    introduction:
      "Canada combines quality institutions with a multicultural way of life. Grand Way helps you select a Designated Learning Institution and prepare a complete study permit application.",
    reasons: [
      "Globally recognised colleges and universities",
      "Inclusive, multicultural student life",
      "Post-graduation work pathways for eligible graduates",
    ],
    steps: [
      {
        title: "Find your program",
        description:
          "Choose an eligible institution, appropriate intake and career-focused program.",
      },
      {
        title: "Receive your offer",
        description:
          "Secure your Letter of Acceptance and confirm your place with the institution.",
      },
      {
        title: "Build your documents",
        description:
          "Prepare your SOP, academic records, financial profile and other required evidence.",
      },
      {
        title: "Submit your study permit",
        description:
          "Complete biometrics, medicals where required and submit your application online.",
      },
    ],
    documents: [
      "Valid passport",
      "Letter of Acceptance",
      "Academic certificates and transcripts",
      "English test result",
      "Statement of Purpose",
      "Financial evidence",
    ],
    opportunities:
      "Eligible students can work part-time during study periods and may qualify for a Post-Graduation Work Permit after graduation.",
  },
  {
    slug: "uk",
    name: "the UK",
    eyebrow: "A tradition of possibility",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=2200&q=85",
    summary:
      "Historic universities, focused degrees and a truly international outlook.",
    introduction:
      "From undergraduate courses to one-year master’s programs, the UK offers an exceptional range of choices. We guide your university application, CAS preparation and visa documentation.",
    reasons: [
      "World-renowned academic institutions",
      "Shorter degree formats for many programs",
      "Culturally rich, well-connected cities",
    ],
    steps: [
      {
        title: "Plan your course",
        description:
          "Consider your career ambitions, preferred city and course entry requirements.",
      },
      {
        title: "Apply to university",
        description:
          "Prepare academic records, English results and a purposeful personal statement.",
      },
      {
        title: "Receive your CAS",
        description:
          "After meeting your offer conditions, your university issues the Confirmation of Acceptance for Studies.",
      },
      {
        title: "Prepare your visa file",
        description:
          "Organise finances, TB screening and application evidence before submitting.",
      },
    ],
    documents: [
      "Passport",
      "CAS letter",
      "Academic certificates",
      "English language certificate",
      "28-day bank statement",
      "IHS reference and visa application",
    ],
    opportunities:
      "The UK offers a broad student experience and career exposure in one of the world’s most international education destinations.",
  },
  {
    slug: "malta",
    name: "Malta",
    eyebrow: "Your European chapter",
    image:
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=2200&q=85",
    summary:
      "English-taught learning in a safe Mediterranean setting with European exposure.",
    introduction:
      "Malta is an increasingly attractive choice for students seeking affordable programs, English instruction and a relaxed Mediterranean lifestyle. We support you from course selection through arrival.",
    reasons: [
      "English-speaking European destination",
      "Accessible living and tuition costs",
      "Student-friendly setting with European mobility",
    ],
    steps: [
      {
        title: "Select your course",
        description:
          "Choose a recognised Maltese institution and program aligned with your plans.",
      },
      {
        title: "Receive your offer",
        description:
          "Review your conditional offer, tuition invoice and official admission confirmation.",
      },
      {
        title: "Prepare your evidence",
        description:
          "Organise academic documents, financial proof, insurance and accommodation details.",
      },
      {
        title: "Submit your application",
        description:
          "Apply through the Visa Application Centre and complete biometrics when needed.",
      },
    ],
    documents: [
      "Valid passport",
      "Offer letter and tuition receipt",
      "Academic certificates",
      "English language proof",
      "Financial and sponsorship documents",
      "Travel insurance and accommodation confirmation",
    ],
    opportunities:
      "Subject to local permissions, students can find part-time opportunities during study and gain valuable European career exposure.",
  },
];

export const getDestination = (slug: string) =>
  destinations.find((destination) => destination.slug === slug);
