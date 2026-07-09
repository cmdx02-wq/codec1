import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all active services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });

    res.json(services);
  } catch (error: any) {
    console.error('Fetch services error:', error);
    res.status(500).json({ error: 'Server error fetching services.' });
  }
});

// Get a single service
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json(service);
  } catch (error: any) {
    console.error('Fetch service error:', error);
    res.status(500).json({ error: 'Server error loading service details.' });
  }
});

export default router;
