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
const jwt = __importStar(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
// Helper to generate JWT
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}
// 1. Password Registration
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, referralCode } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        // Handle referral tracking
        let referredById;
        if (referralCode) {
            const referrer = await prisma_1.default.user.findUnique({ where: { referralCode } });
            if (referrer) {
                referredById = referrer.id;
                // Credit the referrer with a $10 affiliate bonus for onboarding
                await prisma_1.default.user.update({
                    where: { id: referrer.id },
                    data: { affiliateBalance: { increment: 10.0 } },
                });
            }
        }
        const newUser = await prisma_1.default.user.create({
            data: {
                email,
                name,
                passwordHash,
                referredById,
            },
        });
        // Notify the user about welcome
        await prisma_1.default.notification.create({
            data: {
                userId: newUser.id,
                message: `Welcome to AI LaunchPad, ${name}! Start your 14-day career launch today.`,
            },
        });
        const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl,
                referralCode: newUser.referralCode,
                affiliateBalance: newUser.affiliateBalance,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});
// 2. Password Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                referralCode: user.referralCode,
                affiliateBalance: user.affiliateBalance,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});
// 3. Send Email OTP (Logs to terminal, sends email if configured)
router.post('/otp/send', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
        // Ensure user exists or create them with a dummy password
        await prisma_1.default.user.upsert({
            where: { email },
            update: {
                otpToken: otp,
                otpExpires: expires,
            },
            create: {
                email,
                name: email.split('@')[0],
                otpToken: otp,
                otpExpires: expires,
            },
        });
        // Logging the OTP to console for development visibility
        console.log(`\n======================================\n[EMAIL OTP SYSTEM] Sent OTP to ${email}: ${otp}\n======================================\n`);
        res.json({ message: 'OTP sent successfully. Please check your email inbox (and server logs).' });
    }
    catch (error) {
        console.error('OTP Send error:', error);
        res.status(500).json({ error: 'Server error while sending OTP.' });
    }
});
// 4. Verify OTP & Log In
router.post('/otp/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required.' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || user.otpToken !== otp) {
            return res.status(400).json({ error: 'Invalid or incorrect OTP.' });
        }
        if (!user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }
        // Clear OTP after successful verify
        const updatedUser = await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                otpToken: null,
                otpExpires: null,
            },
        });
        const token = generateToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
        res.json({
            token,
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
        console.error('OTP Verify error:', error);
        res.status(500).json({ error: 'Server error during OTP verification.' });
    }
});
// 5. Mock Google OAuth Login (verify code / profile payload)
router.post('/google', async (req, res) => {
    try {
        const { email, name, avatarUrl, googleId } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: 'Google authentication missing email/name.' });
        }
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    avatarUrl,
                },
            });
            await prisma_1.default.notification.create({
                data: {
                    userId: user.id,
                    message: `Welcome to AI LaunchPad, ${name}! Your Google profile was connected.`,
                },
            });
        }
        else if (avatarUrl && !user.avatarUrl) {
            user = await prisma_1.default.user.update({
                where: { id: user.id },
                data: { avatarUrl },
            });
        }
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                referralCode: user.referralCode,
                affiliateBalance: user.affiliateBalance,
            },
        });
    }
    catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Server error during Google Login.' });
    }
});
// 6. Get Current User Info
router.get('/me', auth_1.authenticateJWT, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            include: {
                bookmarks: {
                    include: {
                        course: true,
                        blog: true,
                    },
                },
                notifications: {
                    orderBy: { createdAt: 'desc' },
                    take: 15,
                },
                certificates: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User profile not found.' });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            referralCode: user.referralCode,
            affiliateBalance: user.affiliateBalance,
            bookmarks: user.bookmarks,
            notifications: user.notifications,
            certificates: user.certificates,
        });
    }
    catch (error) {
        console.error('Get Profile error:', error);
        res.status(500).json({ error: 'Server error fetching user profile.' });
    }
});
exports.default = router;
