import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all courses (with optional search, level filters)
router.get('/', async (req, res) => {
  try {
    const { search, difficulty } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (difficulty && difficulty !== 'All') {
      whereClause.difficulty = String(difficulty);
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  } catch (error: any) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ error: 'Server error fetching courses.' });
  }
});

// Get a single course details
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    res.json(course);
  } catch (error: any) {
    console.error('Fetch course error:', error);
    res.status(500).json({ error: 'Server error loading course details.' });
  }
});

export default router;
