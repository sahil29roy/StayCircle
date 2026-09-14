import { studentRepository, StudentRepository, StudentWithUser } from '../repositories/student.repository';
import { roomRepository, RoomRepository } from '../repositories/room.repository';
import { AppError } from '../utils/appError';
import {
  RoommateCompatibility,
  RoomMatchingResult,
  CompatibilityBreakdown,
} from '../types/student';
import { RoomOccupantInfo } from '../types/room';

export class MatchingService {
  constructor(
    private studentRepo: StudentRepository = studentRepository,
    private roomRepo: RoomRepository = roomRepository
  ) {}

  private calculateBudgetScore(a: StudentWithUser, b: RoomOccupantInfo): { score: number; max: number } {
    const max = 25;
    if (!a.budget_min || !a.budget_max || !b.food_preference /* placeholder check */) {
      // If either has no budget range set, give a fair neutral baseline
      return { score: 18, max };
    }

    const aMin = a.budget_min;
    const aMax = a.budget_max;
    // Occupant doesn't have budget stored directly on room occupant info, fallback to neutral if unavailable
    return { score: 20, max };
  }

  private calculateBudgetBetweenStudents(a: StudentWithUser, b: StudentWithUser): { score: number; max: number } {
    const max = 25;
    if (!a.budget_min || !a.budget_max || !b.budget_min || !b.budget_max) {
      return { score: 18, max };
    }

    const overlap = Math.max(0, Math.min(a.budget_max, b.budget_max) - Math.max(a.budget_min, b.budget_min));
    if (overlap > 0) {
      return { score: 25, max };
    }

    const distance = Math.min(
      Math.abs(a.budget_min - b.budget_max),
      Math.abs(b.budget_min - a.budget_max)
    );

    if (distance <= 1500) return { score: 15, max };
    if (distance <= 3500) return { score: 8, max };
    return { score: 0, max };
  }

  private calculateLifestyleScore(a: string | null, b: string | null): { score: number; max: number } {
    const max = 25;
    if (!a || !b) return { score: 16, max };
    if (a === 'ANY' || b === 'ANY' || a === b) return { score: 25, max };
    if (a === 'OCCASIONAL' || b === 'OCCASIONAL') return { score: 12, max };
    return { score: 0, max }; // SMOKER vs NON_SMOKER
  }

  private calculateFoodScore(a: string | null, b: string | null): { score: number; max: number } {
    const max = 15;
    if (!a || !b) return { score: 10, max };
    if (a === 'ANY' || b === 'ANY' || a === b) return { score: 15, max };
    if (
      (a === 'VEGETARIAN' && b === 'EGGETARIAN') ||
      (a === 'EGGETARIAN' && b === 'VEGETARIAN') ||
      (a === 'NON_VEGETARIAN' && b === 'EGGETARIAN') ||
      (a === 'EGGETARIAN' && b === 'NON_VEGETARIAN')
    ) {
      return { score: 10, max };
    }
    return { score: 0, max }; // VEGETARIAN vs NON_VEGETARIAN
  }

  private calculateSleepScore(a: string | null, b: string | null): { score: number; max: number } {
    const max = 10;
    if (!a || !b) return { score: 7, max };
    if (a === b || a === 'NORMAL' || b === 'NORMAL' || a === 'FLEXIBLE' || b === 'FLEXIBLE') {
      return { score: 10, max };
    }
    return { score: 0, max }; // EARLY_BIRD vs NIGHT_OWL
  }

  private calculateCleanlinessScore(a: string | null, b: string | null): { score: number; max: number } {
    const max = 10;
    if (!a || !b) return { score: 7, max };
    if (a === b) return { score: 10, max };

    const levels = ['LOW', 'MODERATE', 'HIGH'];
    const diff = Math.abs(levels.indexOf(a) - levels.indexOf(b));
    if (diff === 1) return { score: 6, max };
    return { score: 0, max };
  }

  private calculateRoomScore(a: string | null, b: string | null): { score: number; max: number } {
    const max = 10;
    if (!a || !b) return { score: 7, max };
    if (a === 'ANY' || b === 'ANY' || a === b) return { score: 10, max };
    return { score: 5, max };
  }

  private calculateACScore(a: string | null, b: string | null): { score: number; max: number } {
    const max = 5;
    if (!a || !b) return { score: 3, max };
    if (a === b || a === 'NOT_REQUIRED' || b === 'NOT_REQUIRED') return { score: 5, max };
    if (
      (a === 'PREFERRED' && b === 'REQUIRED') ||
      (a === 'REQUIRED' && b === 'PREFERRED')
    ) {
      return { score: 4, max };
    }
    return { score: 0, max };
  }

  public comparePreferences(
    requestingStudent: StudentWithUser,
    roommate: StudentWithUser
  ): { compatibilityScore: number; breakdown: CompatibilityBreakdown } {
    const budget = this.calculateBudgetBetweenStudents(requestingStudent, roommate);
    const lifestyle = this.calculateLifestyleScore(
      requestingStudent.smoking_preference,
      roommate.smoking_preference
    );
    const food = this.calculateFoodScore(
      requestingStudent.food_preference,
      roommate.food_preference
    );
    const sleep = this.calculateSleepScore(
      requestingStudent.sleep_schedule,
      roommate.sleep_schedule
    );
    const cleanliness = this.calculateCleanlinessScore(
      requestingStudent.cleanliness_preference,
      roommate.cleanliness_preference
    );
    const room = this.calculateRoomScore(
      requestingStudent.room_preference,
      roommate.room_preference
    );
    const other = this.calculateACScore(
      requestingStudent.ac_preference,
      roommate.ac_preference
    );

    const total =
      budget.score +
      lifestyle.score +
      food.score +
      sleep.score +
      cleanliness.score +
      room.score +
      other.score;

    return {
      compatibilityScore: Math.min(100, Math.max(0, Math.round(total))),
      breakdown: {
        budget,
        lifestyle,
        food,
        sleep,
        cleanliness,
        room,
        other,
      },
    };
  }

  async calculateRoomCompatibility(
    userId: string,
    roomId: string
  ): Promise<RoomMatchingResult> {
    const requestingStudent = await this.studentRepo.findStudentByUserId(userId);
    if (!requestingStudent) {
      throw new AppError('Student profile not found for authenticated user', 404);
    }

    const room = await this.roomRepo.findRawRoomById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    const occupants = await this.roomRepo.getRoomOccupantsInfo(roomId);

    if (occupants.length === 0) {
      return {
        roomId: room.id,
        roomNumber: room.room_number,
        averageCompatibilityScore: null,
        roommates: [],
        message: 'Room currently has no active residents to compare compatibility with',
      };
    }

    const comparisons: RoommateCompatibility[] = [];
    let totalScore = 0;

    for (const occupant of occupants) {
      // Fetch full student profile for occupant to get full preferences
      const occupantStudent = await this.studentRepo.findStudentById(occupant.student_id);
      if (!occupantStudent) continue;

      const { compatibilityScore, breakdown } = this.comparePreferences(
        requestingStudent,
        occupantStudent
      );

      comparisons.push({
        studentId: occupant.student_id,
        name: occupant.name,
        college: occupant.college,
        course: occupant.course,
        year: occupant.year,
        compatibilityScore,
        breakdown,
      });

      totalScore += compatibilityScore;
    }

    const averageScore = comparisons.length > 0 ? Math.round(totalScore / comparisons.length) : null;

    return {
      roomId: room.id,
      roomNumber: room.room_number,
      averageCompatibilityScore: averageScore,
      roommates: comparisons,
    };
  }
}

export const matchingService = new MatchingService();
export default matchingService;
