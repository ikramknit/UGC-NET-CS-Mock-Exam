export enum QuestionStatus {
  NOT_VISITED = 'not_visited',
  NOT_ANSWERED = 'not_answered',
  ANSWERED = 'answered',
  MARKED_FOR_REVIEW = 'marked_for_review',
  ANSWERED_AND_MARKED = 'answered_and_marked',
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  topic: string;
  explanation: string;
}

export interface UserResponse {
  questionId: number;
  selectedOptionIndex: number | null;
  status: QuestionStatus;
}

export interface ExamState {
  questions: Question[];
  responses: Record<number, UserResponse>; // Map question ID to response
  currentQuestionIndex: number;
  timeLeftSeconds: number;
  isExamActive: boolean;
  isSubmitted: boolean;
}

export const TOPICS = [
  "Discrete Structures and Optimization",
  "Computer Arithmetic",
  "Programming in C and C++",
  "Relational Database Design and SQL",
  "Data Structures and Algorithms",
  "Operating Systems",
  "Software Engineering",
  "Data Communication and Computer Networks",
  "Artificial Intelligence",
  "Theory of Computation and Compilers"
];