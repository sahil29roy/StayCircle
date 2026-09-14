import { studentRepository, StudentRepository, StudentWithUser } from '../repositories/student.repository';
import { UpdateStudentPreferencesInput } from '../validators/student.validator';
import { AppError } from '../utils/appError';

export class StudentService {
  constructor(private studentRepo: StudentRepository = studentRepository) {}

  async getProfile(userId: string): Promise<StudentWithUser> {
    const student = await this.studentRepo.findStudentByUserId(userId);
    if (!student) {
      throw new AppError('Student profile not found for authenticated user', 404);
    }
    return student;
  }

  async updatePreferences(
    userId: string,
    input: UpdateStudentPreferencesInput
  ): Promise<StudentWithUser> {
    const student = await this.studentRepo.findStudentByUserId(userId);
    if (!student) {
      throw new AppError('Student profile not found for authenticated user', 404);
    }

    const updated = await this.studentRepo.updateStudentPreferences(student.id, input);
    if (!updated) {
      throw new AppError('Failed to update preferences', 500);
    }
    return updated;
  }
}

export const studentService = new StudentService();
export default studentService;
