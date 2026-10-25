import { Injectable, Logger } from '@nestjs/common';
import { EvaluationStatus, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutoGraderService {
  private readonly logger = new Logger(AutoGraderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async gradeSubmission(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!submission) {
      this.logger.warn(`Submission ${submissionId} not found for auto-grading.`);
      return null;
    }

    let totalScore = 0;
    let requiresManualReview = false;

    for (const answer of submission.answers) {
      const q = answer.question;
      let isCorrect: boolean | null = null;
      let pointsAwarded = 0;

      if (q.type === QuestionType.MCQ) {
        if (answer.selectedOption && q.correctAnswer) {
          isCorrect =
            answer.selectedOption.trim().toUpperCase() ===
            q.correctAnswer.trim().toUpperCase();
          pointsAwarded = isCorrect ? Number(q.maxPoints) : 0;
        } else {
          isCorrect = false;
          pointsAwarded = 0;
        }
      } else if (q.type === QuestionType.SHORT_ANSWER) {
        if (answer.answerContent && q.correctAnswer) {
          isCorrect =
            answer.answerContent.trim().toLowerCase() ===
            q.correctAnswer.trim().toLowerCase();
          pointsAwarded = isCorrect ? Number(q.maxPoints) : 0;
        } else {
          isCorrect = false;
          pointsAwarded = 0;
        }
      } else {
        // Theoretical / Code question requires manual review by teacher/admin
        requiresManualReview = true;
        isCorrect = null;
        pointsAwarded = 0;
      }

      totalScore += pointsAwarded;

      await this.prisma.submissionAnswer.update({
        where: { id: answer.id },
        data: {
          isCorrect,
          score: pointsAwarded,
          gradedAt: new Date(),
        },
      });
    }

    const newStatus = requiresManualReview
      ? EvaluationStatus.MANUAL_REVIEW
      : EvaluationStatus.AUTO_GRADED;

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        rawScore: totalScore,
        status: newStatus,
        gradedAt: new Date(),
      },
      include: {
        answers: true,
      },
    });

    this.logger.log(
      `Submission ${submissionId} auto-graded: score=${totalScore}, status=${newStatus}`,
    );

    return updated;
  }
}
