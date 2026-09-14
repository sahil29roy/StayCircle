import { Request, Response } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = registerSchema.parse(req.body);
    const result = await this.service.register(validatedData);

    res.status(201).json({
      success: true,
      message: `${validatedData.role === 'STUDENT' ? 'Student' : 'Owner'} registered successfully`,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = loginSchema.parse(req.body);
    const result = await this.service.login(validatedData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const user = await this.service.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'Current user profile retrieved successfully',
      data: {
        user,
      },
    });
  });

  logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove your stored token from the client.',
    });
  });
}

export const authController = new AuthController();
export default authController;
