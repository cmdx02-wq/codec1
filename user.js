"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt = __importStar(require("bcryptjs"));
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Multer storage setup for local avatars
const uploadDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    },
});
const upload = (0, multer_1.default)({
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
router.put('/profile', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email) {
            const existingUser = await prisma_1.default.user.findFirst({
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
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error updating user profile.' });
    }
});
// Upload profile picture (Avatar)
router.post('/upload-avatar', auth_1.authenticateJWT, upload.single('avatar'), async (req, res) => {
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
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: error.message || 'Server error uploading avatar.' });
    }
});
// Toggle bookmark for blog or course
router.post('/bookmarks', auth_1.authenticateJWT, async (req, res) => {
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
        const existingBookmark = await prisma_1.default.bookmark.findFirst({
            where: {
                userId,
                courseId: courseId || null,
                blogId: blogId || null,
            },
        });
        if (existingBookmark) {
            // Delete it (Untoggle)
            await prisma_1.default.bookmark.delete({
                where: { id: existingBookmark.id },
            });
            return res.json({ bookmarked: false, message: 'Bookmark removed successfully.' });
        }
        else {
            // Create it (Toggle on)
            await prisma_1.default.bookmark.create({
                data: {
                    userId,
                    courseId: courseId || undefined,
                    blogId: blogId || undefined,
                },
            });
            return res.json({ bookmarked: true, message: 'Bookmark added successfully.' });
        }
    }
    catch (error) {
        console.error('Toggle bookmark error:', error);
        res.status(500).json({ error: 'Server error editing bookmarks.' });
    }
});
// Read Notification
router.put('/notifications/:id/read', auth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.id;
        const notificationId = req.params.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        const updated = await prisma_1.default.notification.updateMany({
            where: { id: notificationId, userId },
            data: { read: true },
        });
        res.json({ message: 'Notification marked as read.', updatedCount: updated.count });
    }
    catch (error) {
        console.error('Read notification error:', error);
        res.status(500).json({ error: 'Server error updating notifications.' });
    }
});
exports.default = router;
