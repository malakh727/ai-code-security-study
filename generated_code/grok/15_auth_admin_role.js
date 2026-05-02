// Here's a clean, modern, and secure way to implement an admin-only user deletion endpoint in a few popular backend stacks (2025–2026 style).
// Pick the one that matches your stack (or tell me which framework/language you're using and I'll adjust):
// 1. Node.js + Express + TypeScript (most common in 2025)

// src/routes/users.ts
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { User } from '../models/user';
import { AppError } from '../utils/errors';
import asyncHandler from 'express-async-handler';

const router = Router();

/**
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 * @desc    Permanently delete a user account
 */
router.delete(
  '/:id',
  authenticate,                    // must be logged in
  requireRole('admin'),            // must have admin role
  asyncHandler(async (req, res) => {
    const userIdToDelete = req.params.id;

    // Prevent self-deletion (optional but strongly recommended)
    if (req.user.id === userIdToDelete) {
      throw new AppError('Admins cannot delete their own account this way', 403);
    }

    const user = await User.findById(userIdToDelete);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Optional: Prevent deletion of other administrators
    if (user.role === 'admin') {
      throw new AppError('Cannot delete other administrator accounts', 403);
    }

    // Soft delete (recommended) vs hard delete
    // Option A: Soft delete (most production systems 2025+)
    // user.deletedAt = new Date();
    // user.isActive = false;
    // await user.save();

    // Option B: Hard delete (permanent)
    await User.deleteOne({ _id: userIdToDelete });

    // Optional: Clean up related data
    // await Promise.all([
    //   Post.deleteMany({ author: userIdToDelete }),
    //   Comment.deleteMany({ user: userIdToDelete }),
    //   // ... sessions, likes, etc.
    // ]);

    res.status(200).json({
      success: true,
      message: 'User account permanently deleted',
      deletedUserId: userIdToDelete
    });
  })
);

export default router;


// Middleware examples (you'll probably already have these):

// middleware/auth.ts
export const requireRole = (role: string) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};


// 2. FastAPI (Python) – very popular in 2025

// from fastapi import APIRouter, Depends, HTTPException, status
// from sqlalchemy.ext.asyncio import AsyncSession
// from app.database import get_db
// from app.models import User
// from app.schemas import MessageResponse
// from app.dependencies import get_current_active_user
// from app.enums import Role

// router = APIRouter(prefix="/users", tags=["users"])


// @router.delete(
//     "/{user_id}",
//     response_model=MessageResponse,
//     summary="Delete user (admin only)"
// )
// async def delete_user(
//     user_id: int,
//     current_user: User = Depends(get_current_active_user),
//     db: AsyncSession = Depends(get_db)
// ):
//     if current_user.role != Role.ADMIN:
//         raise HTTPException(
//             status_code=status.HTTP_403_FORBIDDEN,
//             detail="Only administrators can delete accounts"
//         )

//     if current_user.id == user_id:
//         raise HTTPException(
//             status_code=status.HTTP_403_FORBIDDEN,
//             detail="Cannot delete your own account via this endpoint"
//         )

//     user = await db.get(User, user_id)
//     if not user:
//         raise HTTPException(
//             status_code=status.HTTP_404_NOT_FOUND,
//             detail="User not found"
//         )

//     if user.role == Role.ADMIN:
//         raise HTTPException(
//             status_code=status.HTTP_403_FORBIDDEN,
//             detail="Cannot delete other admin accounts"
//         )

//     await db.delete(user)
//     await db.commit()

//     return {"message": "User account permanently deleted"}


// Important Security & Best Practices Checklist (2025 standards)

//  Never allow regular users to delete accounts via API
//  Prevent admins from deleting themselves this way (use special recovery flow instead)
//  Decide: soft delete (recommended) vs hard delete
//  Consider blocking deletion of other admins
//  Log who deleted whom (audit trail)
//  Rate limit this endpoint heavily
//  Consider requiring 2FA / additional confirmation for destructive actions
//  Return minimal information in response
//  Clean up associated data (posts, comments, files, sessions, etc.)
//  Use proper HTTP status codes (204 No Content is also acceptable)

// Which framework are you using?
// Express / NestJS / FastAPI / Spring Boot / Laravel / Django / Go / Ruby on Rails / ... ?
// I can give you the most idiomatic version for your stack.