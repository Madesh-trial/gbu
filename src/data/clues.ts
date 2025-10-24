export interface Clue {
  id: number;
  question: string;
  answer: string;
  hint: string;
}

export const clues: Clue[] = [
  {
    id: 1,
    question: "This Indian company provides CRM, mail, and office tools rivaling global giants.",
    answer: "zoho",
    hint: "Think of a company from Chennai that starts with 'Z'..."
  },
  {
    id: 2,
    question: "Founded by Bill Gates, this tech titan gave us Windows and Office.",
    answer: "microsoft",
    hint: "The world's most famous software company..."
  },
  {
    id: 3,
    question: "Organizing the world's information is their mission.",
    answer: "google",
    hint: "Search engine giant that became a verb..."
  },
  {
    id: 4,
    question: "This company revolutionized smartphones with its bite logo.",
    answer: "apple",
    hint: "Think fruit, but make it tech..."
  },
  {
    id: 5,
    question: "Once known for its bird logo, now rebranded as 'X'.",
    answer: "twitter",
    hint: "Social media platform where you tweet..."
  }
];
