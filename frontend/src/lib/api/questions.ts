import { api } from './client';
import { Question, QuestionType } from '../../types/api';

export interface CreateQuestionDto {
  title: string;
  prompt: string;
  type: QuestionType;
  formula?: string;
  options?: any[]; // for MCQ: string[] or object
  correctAnswer?: any;
  explanation?: string;
  points: number;
  rubricCriteria?: any;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {}

export const questionsApi = {
  findAll: async (contestId: string): Promise<Question[]> => {
    return api.get<Question[]>(`/contests/${contestId}/questions`);
  },

  findOne: async (contestId: string, questionId: string): Promise<Question> => {
    return api.get<Question>(`/contests/${contestId}/questions/${questionId}`);
  },

  create: async (contestId: string, dto: CreateQuestionDto): Promise<Question> => {
    return api.post<Question>(`/contests/${contestId}/questions`, dto);
  },

  update: async (contestId: string, questionId: string, dto: UpdateQuestionDto): Promise<Question> => {
    return api.put<Question>(`/contests/${contestId}/questions/${questionId}`, dto);
  },

  reorder: async (contestId: string, orderedQuestionIds: string[]): Promise<{ message: string }> => {
    return api.put<{ message: string }>(`/contests/${contestId}/questions/reorder`, {
      orderedQuestionIds,
    });
  },

  delete: async (contestId: string, questionId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/contests/${contestId}/questions/${questionId}`);
  },
};
