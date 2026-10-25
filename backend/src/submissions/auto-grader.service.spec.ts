import { EvaluationStatus, QuestionType } from '@prisma/client';
import { AutoGraderService } from './auto-grader.service';

describe('AutoGraderService (Unit)', () => {
  let service: AutoGraderService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      submission: {
        findUnique: jest.fn(),
        update: jest.fn().mockImplementation((args) => Promise.resolve({
          id: args.where.id,
          rawScore: args.data.rawScore,
          status: args.data.status,
          gradedAt: args.data.gradedAt,
        })),
      },
      submissionAnswer: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    service = new AutoGraderService(mockPrisma);
  });

  it('should accurately grade MCQ and short-answer questions', async () => {
    const submissionId = 'sub-123';
    const mockSubmission = {
      id: submissionId,
      contestId: 'contest-1',
      answers: [
        {
          id: 'ans-1',
          questionId: 'q-1',
          selectedOption: 'B',
          answerContent: null,
          question: {
            id: 'q-1',
            type: QuestionType.MCQ,
            correctAnswer: 'B',
            maxPoints: 10,
          },
        },
        {
          id: 'ans-2',
          questionId: 'q-2',
          selectedOption: null,
          answerContent: '  Speed of Light ',
          question: {
            id: 'q-2',
            type: QuestionType.SHORT_ANSWER,
            correctAnswer: 'speed of light',
            maxPoints: 15,
          },
        },
        {
          id: 'ans-3',
          questionId: 'q-3',
          selectedOption: 'A',
          answerContent: null,
          question: {
            id: 'q-3',
            type: QuestionType.MCQ,
            correctAnswer: 'D',
            maxPoints: 10,
          },
        },
      ],
    };

    mockPrisma.submission.findUnique.mockResolvedValue(mockSubmission);

    const result = await service.gradeSubmission(submissionId);

    expect(result.rawScore).toBe(25); // 10 + 15 + 0
    expect(result.status).toBe(EvaluationStatus.AUTO_GRADED);
    expect(mockPrisma.submissionAnswer.update).toHaveBeenCalledTimes(3);

    // Verify first correct MCQ
    expect(mockPrisma.submissionAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ans-1' },
        data: expect.objectContaining({ isCorrect: true, score: 10 }),
      }),
    );

    // Verify second correct short answer (trimmed and case-insensitive)
    expect(mockPrisma.submissionAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ans-2' },
        data: expect.objectContaining({ isCorrect: true, score: 15 }),
      }),
    );

    // Verify third incorrect MCQ
    expect(mockPrisma.submissionAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ans-3' },
        data: expect.objectContaining({ isCorrect: false, score: 0 }),
      }),
    );
  });

  it('should mark submission status as MANUAL_REVIEW if theoretical or code questions exist', async () => {
    const submissionId = 'sub-456';
    const mockSubmission = {
      id: submissionId,
      contestId: 'contest-2',
      answers: [
        {
          id: 'ans-1',
          questionId: 'q-1',
          selectedOption: 'A',
          answerContent: null,
          question: {
            id: 'q-1',
            type: QuestionType.MCQ,
            correctAnswer: 'A',
            maxPoints: 10,
          },
        },
        {
          id: 'ans-2',
          questionId: 'q-2',
          selectedOption: null,
          answerContent: 'Derivation of Maxwell equations...',
          question: {
            id: 'q-2',
            type: QuestionType.THEORETICAL,
            correctAnswer: null,
            maxPoints: 20,
          },
        },
      ],
    };

    mockPrisma.submission.findUnique.mockResolvedValue(mockSubmission);

    const result = await service.gradeSubmission(submissionId);

    expect(result.status).toBe(EvaluationStatus.MANUAL_REVIEW);
    expect(result.rawScore).toBe(10);
  });
});
