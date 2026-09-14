import { Request, Response } from 'express';
import { studentService, StudentService } from '../services/student.service';
import { updateStudentPreferencesSchema } from '../validators/student.validator';
import { asyncHandler } from '../utils/asyncHandler';

export class StudentController {
  constructor(private service: StudentService = studentService) {}

  getMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const student = await this.service.getProfile(req.user!.userId);

    res.status(200).json({
      success: true,
      data: student,
    });
  });

  updateMyPreferences = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validated = updateStudentPreferencesSchema.parse(req.body);
    const updated = await this.service.updatePreferences(req.user!.userId, validated);

    res.status(200).json({
      success: true,
      message: 'Student preferences updated successfully',
      data: updated,
    });
  });
}

export const studentController = new StudentController();
export default studentController;
