import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply auth + admin verification middleware to all endpoints here
router.use(authenticateJWT);
router.use(requireAdmin);

// 1. Get Analytics Dashboard Data
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalCourses = await prisma.course.count();
    const totalServices = await prisma.service.count();
    const totalOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    
    // Revenue calculations
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { totalAmount: true },
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Latest Orders
    const latestOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
        service: { select: { name: true } },
      },
    });

    // Registrations Over Time (Mock daily chart dataset matching last 7 days)
    const registrationsByDay = [
      { day: 'Mon', count: 12 },
      { day: 'Tue', count: 19 },
      { day: 'Wed', count: 15 },
      { day: 'Thu', count: 22 },
      { day: 'Fri', count: 30 },
      { day: 'Sat', count: 25 },
      { day: 'Sun', count: 35 },
    ];

    // Revenue Over Time (Mock)
    const revenueByDay = [
      { day: 'Mon', amount: 450 },
      { day: 'Tue', amount: 890 },
      { day: 'Wed', amount: 620 },
      { day: 'Thu', amount: 1200 },
      { day: 'Fri', amount: 1500 },
      { day: 'Sat', amount: 980 },
      { day: 'Sun', amount: 1850 },
    ];

    res.json({
      metrics: {
        totalUsers,
        totalCourses,
        totalServices,
        totalOrders,
        totalRevenue,
      },
      latestOrders,
      registrationsByDay,
      revenueByDay,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Server error compiling analytical trends.' });
  }
});

// 2. User Management
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        affiliateBalance: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error loading users.' });
  }
});

router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, role } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { name, role },
    });
    res.json({ message: 'User updated successfully.', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error modifying user details.' });
  }
});

router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'User deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error deleting user.' });
  }
});

// 3. Course management CRUD
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, thumbnail, price, isFree, difficulty, duration, modules } = req.body;
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        price: Number(price),
        isFree: Boolean(isFree),
        difficulty,
        duration,
        modules: modules || [],
      },
    });
    res.status(201).json({ message: 'Course created successfully.', course: newCourse });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error creating course.' });
  }
});

router.put('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, thumbnail, price, isFree, difficulty, duration, modules } = req.body;
    const updated = await prisma.course.update({
      where: { id: req.params.id as string },
      data: {
        title,
        description,
        thumbnail,
        price: Number(price),
        isFree: Boolean(isFree),
        difficulty,
        duration,
        modules: modules || [],
      },
    });
    res.json({ message: 'Course updated successfully.', course: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error updating course.' });
  }
});

router.delete('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Course deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error deleting course.' });
  }
});

// 4. Service management CRUD
router.post('/services', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, price, active } = req.body;
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        image,
        price: Number(price),
        active: Boolean(active),
      },
    });
    res.status(201).json({ message: 'Service created successfully.', service: newService });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error creating service.' });
  }
});

router.put('/services/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, price, active } = req.body;
    const updated = await prisma.service.update({
      where: { id: req.params.id as string },
      data: {
        name,
        description,
        image,
        price: Number(price),
        active: Boolean(active),
      },
    });
    res.json({ message: 'Service updated successfully.', service: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error updating service.' });
  }
});

router.delete('/services/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Service deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error deleting service.' });
  }
});

// 5. Blog CRUD
router.post('/blogs', async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, content, featuredImage, category, published } = req.body;
    const authorId = req.user?.id;
    if (!authorId) return res.status(401).json({ error: 'Unauthorized.' });

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content,
        featuredImage,
        category,
        published: Boolean(published),
        authorId,
      },
    });
    res.status(201).json({ message: 'Blog created successfully.', blog: newBlog });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error creating blog post.' });
  }
});

router.put('/blogs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, content, featuredImage, category, published } = req.body;
    const updated = await prisma.blog.update({
      where: { id: req.params.id as string },
      data: {
        title,
        slug,
        content,
        featuredImage,
        category,
        published: Boolean(published),
      },
    });
    res.json({ message: 'Blog post updated successfully.', blog: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error updating blog post.' });
  }
});

router.delete('/blogs/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.blog.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Blog post deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error deleting blog post.' });
  }
});

// 6. CSV Export of Sales Data
router.get('/export/orders', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let csvContent = 'OrderID,CustomerName,CustomerEmail,ProductPurchased,Amount,Status,Date\n';

    orders.forEach((order) => {
      const product = order.course?.title || order.service?.name || 'Unknown';
      const cleanName = order.user.name.replace(/,/g, '');
      const line = `"${order.id}","${cleanName}","${order.user.email}","${product.replace(/,/g, '')}",$${order.totalAmount},"${order.status}","${order.createdAt.toISOString()}"\n`;
      csvContent += line;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ailaunchpad-orders.csv');
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Server error compiling CSV transaction download.' });
  }
});

export default router;
