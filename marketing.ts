import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Submit a Contact form message
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        userId: userId || undefined,
      },
    });

    res.status(201).json({
      message: 'Your inquiry has been submitted! Our support team will contact you shortly.',
      data: newMessage,
    });
  } catch (error: any) {
    console.error('Contact submit error:', error);
    res.status(500).json({ error: 'Server error processing contact form.' });
  }
});

// Subscribe to newsletter
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.active) {
        return res.status(400).json({ error: 'This email is already subscribed to our newsletter.' });
      }
      // Re-activate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { active: true },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email },
      });
    }

    res.status(201).json({
      message: 'Awesome! You have successfully subscribed to the AI LaunchPad newsletter.',
    });
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Server error processing newsletter subscription.' });
  }
});

export default router;
