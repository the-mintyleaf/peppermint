export type TestClass = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  covers: string[];
};

export const classes: TestClass[] = [
  {
    slug: "ielts",
    name: "IELTS",
    tagline: "The English test most universities ask for",
    description:
      "Small batches that work through all four modules with real timed practice. You sit regular mock tests, get your band estimate back with the reasons behind it, and focus your remaining weeks on whichever module is holding your score down.",
    covers: [
      "Listening",
      "Reading",
      "Writing Task 1 and 2",
      "Speaking practice",
      "Full mock tests",
      "Band-score feedback",
    ],
  },
  {
    slug: "pte",
    name: "PTE",
    tagline: "Computer-scored, quick to book, quick to results",
    description:
      "PTE rewards knowing exactly how the scoring engine reads your answers. We drill the question types that carry the most weight, work on the microphone technique that trips most candidates up, and practise on screen so test day feels familiar.",
    covers: [
      "Speaking and writing",
      "Reading",
      "Listening",
      "Question-type strategy",
      "Scored practice on screen",
      "Score-report review",
    ],
  },
  {
    slug: "japanese",
    name: "Japanese language",
    tagline: "From your first characters to JLPT N5 and N4",
    description:
      "Built for students heading to a Japanese university or language school. You start with hiragana and katakana, build kanji and grammar steadily, and practise the everyday conversation you will need from your first week in Japan.",
    covers: [
      "Hiragana and katakana",
      "Kanji and grammar",
      "JLPT N5 and N4 preparation",
      "NAT-Test preparation",
      "Conversation practice",
      "Everyday culture and etiquette",
    ],
  },
];
