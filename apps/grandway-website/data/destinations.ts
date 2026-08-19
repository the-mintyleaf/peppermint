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
  {
    slug: "london",
    name: "London",
    eyebrow: "A capital of ideas",
    image:
      "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=2200&q=85",
    summary:
      "Study at the centre of a global city where almost every industry is on your doorstep.",
    introduction:
      "London gathers world-leading universities, employers and cultures into a single city. We help you choose the right London institution, prepare a competitive application and plan realistically for the cost of living there.",
    reasons: [
      "Universities ranked among the world’s best",
      "Industry access and internships across every sector",
      "One of the most connected, multicultural cities anywhere",
    ],
    steps: [
      {
        title: "Choose your institution",
        description:
          "Compare London universities and colleges by course content, entry requirements and campus location.",
      },
      {
        title: "Apply and meet your offer",
        description:
          "Submit academic records, English results and a personal statement, then satisfy any offer conditions.",
      },
      {
        title: "Plan your budget",
        description:
          "Prepare for London maintenance requirements, accommodation deposits and everyday living costs.",
      },
      {
        title: "Complete your visa file",
        description:
          "Receive your CAS, pay the immigration health surcharge and submit your Student route application.",
      },
    ],
    documents: [
      "Passport",
      "CAS letter",
      "Academic certificates and transcripts",
      "English language certificate",
      "28-day bank statement covering tuition and London maintenance",
      "IHS payment reference and visa application",
    ],
    opportunities:
      "Students can usually work limited hours during term time under their visa conditions, and eligible graduates may apply to stay on through the Graduate route.",
  },
  {
    slug: "japan",
    name: "Japan",
    eyebrow: "Precision and possibility",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2200&q=85",
    summary:
      "Advanced research, deep tradition and one of the safest study settings in the world.",
    introduction:
      "Japan pairs strong research universities with a growing number of English-taught degrees and language-school pathways. We help you select the right route, apply for your Certificate of Eligibility and prepare your visa file.",
    reasons: [
      "Leading research universities and English-taught degree programs",
      "Scholarship options including MEXT and JASSO support",
      "Safe cities, dependable transport and a rich everyday culture",
    ],
    steps: [
      {
        title: "Choose your pathway",
        description:
          "Decide between a degree program or a language-school route, then shortlist institutions and intakes.",
      },
      {
        title: "Secure your admission",
        description:
          "Complete entrance requirements and receive your letter of admission from the institution.",
      },
      {
        title: "Apply for your Certificate of Eligibility",
        description:
          "Your institution applies on your behalf with the documents you prepare with us.",
      },
      {
        title: "Submit your student visa",
        description:
          "Apply at the embassy or consulate with your Certificate of Eligibility and supporting evidence.",
      },
    ],
    documents: [
      "Valid passport",
      "Certificate of Eligibility",
      "Letter of admission",
      "Academic certificates and transcripts",
      "Japanese or English proficiency evidence",
      "Proof of financial support",
    ],
    opportunities:
      "With the appropriate permission, students may take on limited part-time work during their studies and explore graduate employment pathways after completing their program.",
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    eyebrow: "Space to think",
    image:
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=2200&q=85",
    summary:
      "Quality universities, small class sizes and an outdoors that resets you every weekend.",
    introduction:
      "New Zealand offers internationally respected universities and practical institutes of technology in a calm, safe setting. We guide your provider choice, Offer of Place and student visa application.",
    reasons: [
      "Internationally ranked universities and hands-on polytechnics",
      "Small cohorts with close access to teaching staff",
      "Post-study work options for eligible graduates",
    ],
    steps: [
      {
        title: "Choose your provider",
        description:
          "Select an approved institution and a program that matches your goals and budget.",
      },
      {
        title: "Receive your Offer of Place",
        description:
          "Accept your offer, pay tuition as required and obtain your receipt for the visa file.",
      },
      {
        title: "Prepare your evidence",
        description:
          "Organise academic records, funds, insurance and any medical requirements.",
      },
      {
        title: "Apply for your visa",
        description:
          "Submit your student visa application online with complete supporting documents.",
      },
    ],
    documents: [
      "Valid passport",
      "Offer of Place and tuition receipt",
      "Academic certificates and transcripts",
      "English test result",
      "Evidence of funds for living costs",
      "Medical certificate and travel insurance where required",
    ],
    opportunities:
      "Eligible students can work limited hours during study and may apply for a post-study work visa after completing a qualifying program.",
  },
  {
    slug: "germany",
    name: "Germany",
    eyebrow: "Engineering your future",
    image:
      "https://images.unsplash.com/photo-1554072675-66db59dba46f?auto=format&fit=crop&w=2200&q=85",
    summary:
      "Low or no tuition at public universities, with strong links to industry and research.",
    introduction:
      "Germany is one of the most cost-effective destinations for serious study, particularly in engineering, sciences and business. We help you navigate uni-assist, admission requirements and the blocked account process.",
    reasons: [
      "Public universities with little or no tuition fees",
      "Strong engineering, science and business programs tied to industry",
      "A job-seeking residence permit for graduates who qualify",
    ],
    steps: [
      {
        title: "Choose your program",
        description:
          "Shortlist public or applied-sciences universities and confirm language of instruction.",
      },
      {
        title: "Apply for admission",
        description:
          "Submit through uni-assist or the university directly, with certificates recognised where required.",
      },
      {
        title: "Open your blocked account",
        description:
          "Deposit the required living-cost amount and arrange your health insurance cover.",
      },
      {
        title: "Apply for your national visa",
        description:
          "Book your embassy appointment and present your complete study visa file.",
      },
    ],
    documents: [
      "Valid passport",
      "Letter of admission",
      "Academic certificates and transcripts",
      "German or English proficiency certificate",
      "Blocked account confirmation",
      "Health insurance and motivation letter",
    ],
    opportunities:
      "International students can work a limited number of days each year alongside their studies, and graduates may apply for a residence permit to look for related employment.",
  },
  {
    slug: "europe",
    name: "Europe",
    eyebrow: "One continent, many doors",
    image:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=2200&q=85",
    summary:
      "English-taught degrees across the continent, with affordable tuition and easy travel.",
    introduction:
      "If you are open to more than one country, Europe offers hundreds of English-taught programs across the Netherlands, Ireland, France, Italy, Poland, the Baltics and beyond. We help you compare countries honestly and apply where you fit best.",
    reasons: [
      "Hundreds of English-taught bachelor’s and master’s programs",
      "Affordable tuition and living costs in many countries",
      "Schengen mobility and genuinely international classrooms",
    ],
    steps: [
      {
        title: "Shortlist your countries",
        description:
          "Weigh tuition, living costs, language and work rights across a few realistic options.",
      },
      {
        title: "Apply and receive admission",
        description:
          "Prepare each application to the country’s requirements and secure your acceptance letter.",
      },
      {
        title: "Arrange finances and cover",
        description:
          "Organise proof of funds, health insurance and accommodation confirmation.",
      },
      {
        title: "Apply for your permit",
        description:
          "Submit the national student visa or residence permit application for your chosen country.",
      },
    ],
    documents: [
      "Valid passport",
      "Acceptance letter and tuition receipt",
      "Academic certificates and transcripts",
      "English language proof",
      "Proof of funds for living costs",
      "Health insurance and accommodation confirmation",
    ],
    opportunities:
      "Most European countries allow limited part-time work during study, and several offer a post-study residence permit so graduates can look for work locally.",
  },
];

export const featuredDestinations = destinations.slice(0, 4);

export const getDestination = (slug: string) =>
  destinations.find((destination) => destination.slug === slug);
