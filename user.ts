import { Router, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateJWT } from '../middleware/auth';

const router = Router();

// Multer storage setup for local avatars
const uploadDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimeMatch = allowedTypes.test(file.mimetype);
    const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeMatch && extMatch) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG and WEBP image uploads are allowed!'));
  },
});

// Update profile data
router.put('/profile', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use by another account.' });
      }
      updateData.email = email;
    }

    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        referralCode: updatedUser.referralCode,
        affiliateBalance: updatedUser.affiliateBalance,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating user profile.' });
  }
});

// Upload profile picture (Avatar)
router.post('/upload-avatar', authenticateJWT, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload.' });
    }

    // Static URL layout
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    res.json({
      message: 'Avatar uploaded successfully!',
      avatarUrl,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: error.message || 'Server error uploading avatar.' });
  }
});

// Toggle bookmark for blog or course
router.post('/bookmarks', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, blogId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!courseId && !blogId) {
      return res.status(400).json({ error: 'Either courseId or blogId must be provided.' });
    }

    // Check if it already exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        courseId: courseId || null,
        blogId: blogId || null,
      },
    });

    if (existingBookmark) {
      // Delete it (Untoggle)
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return res.json({ bookmarked: false, message: 'Bookmark removed successfully.' });
    } else {
      // Create it (Toggle on)
      await prisma.bookmark.create({
        data: {
          userId,
          courseId: courseId || undefined,
          blogId: blogId || undefined,
        },
      });
      return res.json({ bookmarked: true, message: 'Bookmark added successfully.' });
    }
  } catch (error: any) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Server error editing bookmarks.' });
  }
});

// Read Notification
router.put('/notifications/:id/read', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updated = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });

    res.json({ message: 'Notification marked as read.', updatedCount: updated.count });
  } catch (error: any) {
    console.error('Read notification error:', error);
    res.status(500).json({ error: 'Server error updating notifications.' });
  }
});

export default router;
