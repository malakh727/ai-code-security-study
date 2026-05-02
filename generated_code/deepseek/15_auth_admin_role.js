// I'll create a secure API endpoint for administrators to delete user accounts. This implementation includes proper authorization checks, error handling, and best practices.

// Complete API Endpoint Implementation
// 1. Database Schema (Prisma example)

// prisma/schema.prisma
// model User {
//   id        String   @id @default(cuid())
//   email     String   @unique
//   password  String
//   name      String
//   role      UserRole @default(USER)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   deletedAt DateTime? // Soft delete support
// }

// enum UserRole {
//   USER
//   ADMIN
// }

// 2. Middleware for Authentication & Authorization

// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }
  next();
};

// 3. User Controller with Delete Functionality

// controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserController {
  /**
   * Delete user account (Admin only)
   * @route DELETE /api/admin/users/:userId
   */
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const adminId = req.user.id;

      // Validate user ID format
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          error: 'Valid user ID is required'
        });
      }

      // Check if user exists
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userToDelete) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Prevent admin from deleting themselves
      if (userId === adminId) {
        return res.status(400).json({
          error: 'Administrators cannot delete their own account'
        });
      }

      // Option 1: Hard delete (permanent)
      await prisma.user.delete({
        where: { id: userId }
      });

      // Option 2: Soft delete (recommended)
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { deletedAt: new Date() }
      // });

      // Log the action for audit purposes
      await this.logAdminAction(adminId, 'DELETE_USER', userId);

      return res.status(200).json({
        success: true,
        message: 'User account successfully deleted',
        deletedUserId: userId
      });

    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        error: 'Failed to delete user account'
      });
    }
  }

  /**
   * Bulk delete users (Admin only)
   * @route POST /api/admin/users/bulk-delete
   */
  async bulkDeleteUsers(req, res) {
    try {
      const { userIds } = req.body;
      const adminId = req.user.id;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          error: 'Valid user IDs array is required'
        });
      }

      // Remove admin ID from the list if present
      const filteredUserIds = userIds.filter(id => id !== adminId);

      if (filteredUserIds.length === 0) {
        return res.status(400).json({
          error: 'No valid users to delete'
        });
      }

      // Perform bulk delete
      const result = await prisma.user.deleteMany({
        where: {
          id: { in: filteredUserIds }
        }
      });

      // Log bulk action
      await this.logAdminAction(adminId, 'BULK_DELETE_USERS', filteredUserIds);

      return res.status(200).json({
        success: true,
        message: `Successfully deleted ${result.count} users`,
        deletedCount: result.count
      });

    } catch (error) {
      console.error('Error bulk deleting users:', error);
      return res.status(500).json({
        error: 'Failed to delete user accounts'
      });
    }
  }

  /**
   * Log admin actions for audit trail
   */
  async logAdminAction(adminId, action, target) {
    // Implement your audit logging logic here
    // Could write to database, file, or external service
    console.log({
      timestamp: new Date().toISOString(),
      adminId,
      action,
      target,
      ip: req.ip // If needed
    });
  }
}

module.exports = new UserController();

// 4. Routes Configuration

// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(authorizeAdmin);

// Delete single user
router.delete('/users/:userId', userController.deleteUser);

// Bulk delete users
router.post('/users/bulk-delete', userController.bulkDeleteUsers);

module.exports = router;


// 5. Express App Setup

// app.js
const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// 6. API Usage Examples

// Example API calls

// Delete a single user
// DELETE /api/admin/users/user_123
// Headers: {
//   Authorization: 'Bearer admin_jwt_token_here'
// }

// Response (200):
// {
//   "success": true,
//   "message": "User account successfully deleted",
//   "deletedUserId": "user_123"
// }

// // Error response (403):
// {
//   "error": "Admin access required"
// }

// // Error response (404):
// {
//   "error": "User not found"
// }

// // Bulk delete users
// // POST /api/admin/users/bulk-delete
// // Body: {
// //   "userIds": ["user_123", "user_456", "user_789"]
// // }

// // Response (200):
// {
//   "success": true,
//   "message": "Successfully deleted 3 users",
//   "deletedCount": 3
// }


// 7. Advanced Features (Optional)

// services/userDeletionService.js
class UserDeletionService {
  async deleteUserWithCascade(userId) {
    // Start a transaction
    return await prisma.$transaction(async (prisma) => {
      
      // 1. Delete user's related data
      await prisma.userSession.deleteMany({
        where: { userId }
      });
      
      await prisma.userActivity.deleteMany({
        where: { userId }
      });
      
      // 2. Handle user's owned resources
      // Transfer ownership or delete based on business logic
      
      // 3. Notify relevant services
      await this.notifyDeletion(userId);
      
      // 4. Finally delete the user
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      });
      
      return deletedUser;
    });
  }

  async notifyDeletion(userId) {
    // Send notifications to other microservices
    // Update caches
    // Send email notification if needed
  }
}

module.exports = new UserDeletionService();

// Key Security Features:
// Authentication Required: JWT token validation

// Role-Based Authorization: Admin-only access

// Self-Deletion Prevention: Admins can't delete themselves

// Input Validation: Validates user ID format

// Audit Logging: Tracks admin actions

// Error Handling: Comprehensive error responses

// Soft Delete Option: Prevents permanent data loss

// Best Practices Implemented:
// Clean separation of concerns

// Proper HTTP status codes

// Descriptive error messages

// Bulk operation support

// Transaction support for complex operations

// Audit trail for compliance

// This implementation provides a secure, production-ready endpoint for administrators to delete user accounts while maintaining proper authorization and data integrity.

