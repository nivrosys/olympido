import { api } from './client';
import { Submission, SubmissionAnswer } from '../../types/api';

export interface AnswerItemDto {
  questionId: string;
  answerPayload: any; // { selectedOption: number } or { answerText: string }
}

export interface SubmitAnswersDto {
  answers: AnswerItemDto[];
}

export interface GradeAnswerDto {
  awardedPoints: number;
  isCorrect?: boolean;
  feedbackNotes?: string;
}

export const submissionsApi = {
  submitAll: async (contestId: string, dto: SubmitAnswersDto): Promise<Submission> => {
    return api.post<Submission>(`/contests/${contestId}/submit`, dto);
  },

  saveSingleAnswer: async (
    contestId: string,
    questionId: string,
    answerPayload: any
  ): Promise<SubmissionAnswer> => {
    return api.put<SubmissionAnswer>(`/contests/${contestId}/submit/${questionId}`, {
      answerPayload,
    });
  },

  getMySubmission: async (contestId: string): Promise<Submission | null> => {
    return api.get<Submission | null>(`/contests/${contestId}/my-submission`);
  },

  getContestSubmissions: async (
    contestId: string,
    page = 1,
    limit = 20
  ): Promise<{ submissions: Submission[]; total: number; page: number; limit: number }> => {
    return api.get<{ submissions: Submission[]; total: number; page: number; limit: number }>(
      `/contests/${contestId}/submissions`,
      { params: { page, limit } }
    );
  },

  gradeAnswer: async (answerId: string, dto: GradeAnswerDto): Promise<SubmissionAnswer> => {
    return api.put<SubmissionAnswer>(`/contests/answers/${answerId}/grade`, dto);
  },
};
