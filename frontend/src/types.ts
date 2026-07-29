export type TopicStatus = 'PENDENTE' | 'ESTUDANDO' | 'REVISANDO' | 'DOMINADO';
export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';
export type ReviewStatus = 'PENDENTE' | 'ATRASADA' | 'CONCLUIDA';
export type ExamType = 'FUVEST' | 'ENEM' | 'OUTRO';
export type ScheduleStatus = 'PLANEJADO' | 'CONCLUIDO' | 'CANCELADO';

export interface User {
  id: string;
  name: string;
  email: string;
  dailyGoalMin: number;
  createdAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  _count?: { topics: number };
  topics?: Topic[];
}

export interface Topic {
  id: string;
  subjectId: string;
  parentId?: string | null;
  name: string;
  description?: string | null;
  status: TopicStatus;
  priority: Priority;
  difficulty: Difficulty;
  fuvestImportance: number;
  enemImportance: number;
  studyDate?: string | null;
  nextReviewDate?: string | null;
  subject?: Subject;
  subtopics?: Topic[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  topicId: string;
  dueDate: string;
  intervalDays: number;
  status: ReviewStatus;
  completedAt?: string | null;
  performance?: number | null;
  topic: Topic & { subject: Subject };
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId?: string | null;
  durationMin: number;
  date: string;
  notes?: string | null;
  subject: Subject;
  topic?: Pick<Topic, 'id' | 'name'> | null;
}

export interface Question {
  id: string;
  topicId: string;
  examType: ExamType;
  year?: number | null;
  institution?: string | null;
  difficulty: Difficulty;
  isCorrect: boolean;
  timeSpentSec?: number | null;
  errorNote?: string | null;
  createdAt: string;
  topic: Topic & { subject: Subject };
  mistake?: Mistake | null;
}

export interface QuestionStatistic {
  subject: string;
  topic: string;
  topicId: string;
  total: number;
  correct: number;
  accuracyPercent: number;
  reviewPriority: number;
}

export interface Mistake {
  id: string;
  questionId: string;
  reason: string;
  howToFix?: string | null;
  createdAt: string;
  question: Question;
}

export interface Essay {
  id: string;
  theme: string;
  date: string;
  score?: number | null;
  comp1?: number | null;
  comp2?: number | null;
  comp3?: number | null;
  comp4?: number | null;
  comp5?: number | null;
  feedback?: string | null;
}

export interface Schedule {
  id: string;
  subjectId: string;
  topicId?: string | null;
  title?: string | null;
  date: string;
  durationMin: number;
  status: ScheduleStatus;
  notes?: string | null;
  subject: Subject;
  topic?: Topic | null;
}

export interface ScheduleSuggestion {
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  durationMin: number;
  reason: string;
}

export interface DashboardData {
  weekHoursStudied: number;
  dailyGoal: {
    goalMin: number;
    studiedMin: number;
    progressPercent: number;
  };
  overallProgress: number;
  hardestSubjects: Array<{
    subject: string;
    color: string;
    difficultyScore: number;
  }>;
  overdueReviews: Review[];
  upcomingTasks: {
    reviews: Review[];
    schedules: Schedule[];
  };
  questionsPerformance: {
    total: number;
    correct: number;
    accuracyPercent: number | null;
  };
}

export interface DashboardCharts {
  accuracyEvolution: Array<{
    week: string;
    accuracyPercent: number;
    totalQuestions: number;
  }>;
  timePerSubject: Array<{ subject: string; hours: number }>;
  monthlyEvolution: Array<{ month: string; hours: number }>;
}
