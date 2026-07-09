import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateJWT } from '../middleware/auth';

const router = Router();

// Get all published blogs
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;

    const whereClause: any = { published: true };

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { content: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'All') {
      whereClause.category = String(category);
    }

    const blogs = await prisma.blog.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(blogs);
  } catch (error: any) {
    console.error('Fetch blogs error:', error);
    res.status(500).json({ error: 'Server error fetching blogs.' });
  }
});

// Get blog by slug (with details)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, avatarUrl: true },
        },
        comments: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Increment view count asynchronously
    await prisma.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    });

    // Fetch related articles (same category, different ID, max 3)
    const related = await prisma.blog.findMany({
      where: {
        category: blog.category,
        id: { not: blog.id },
        published: true,
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ blog, related });
  } catch (error: any) {
    console.error('Fetch blog detail error:', error);
    res.status(500).json({ error: 'Server error loading blog post.' });
  }
});

// Post comment to a blog post
router.post('/:id/comments', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const blogId = req.params.id as string;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required.' });
    }

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        blogId,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(newComment);
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error adding comment.' });
  }
});

export default router;
