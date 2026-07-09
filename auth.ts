import { Router, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateJWT } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

// Helper to generate JWT
function generateToken(user: { id: string; email: string; role: 'USER' | 'ADMIN' }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. Password Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, referralCode } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Handle referral tracking
    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) {
        referredById = referrer.id;
        // Credit the referrer with a $10 affiliate bonus for onboarding
        await prisma.user.update({
          where: { id: referrer.id },
          data: { affiliateBalance: { increment: 10.0 } },
        });
      }
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        referredById,
      },
    });

    // Notify the user about welcome
    await prisma.notification.create({
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
  } catch (error: any) {
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

    const user = await prisma.user.findUnique({ where: { email } });
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
  } catch (error: any) {
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
    await prisma.user.upsert({
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
  } catch (error: any) {
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.otpToken !== otp) {
      return res.status(400).json({ error: 'Invalid or incorrect OTP.' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP after successful verify
    const updatedUser = await prisma.user.update({
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
  } catch (error: any) {
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

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          message: `Welcome to AI LaunchPad, ${name}! Your Google profile was connected.`,
        },
      });
    } else if (avatarUrl && !user.avatarUrl) {
      user = await prisma.user.update({
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
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Server error during Google Login.' });
  }
});

// 6. Get Current User Info
router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await prisma.user.findUnique({
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
  } catch (error: any) {
    console.error('Get Profile error:', error);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

export default router;
