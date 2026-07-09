"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth + admin verification middleware to all endpoints here
router.use(auth_1.authenticateJWT);
router.use(auth_1.requireAdmin);
// 1. Get Analytics Dashboard Data
router.get('/analytics', async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count();
        const totalCourses = await prisma_1.default.course.count();
        const totalServices = await prisma_1.default.service.count();
        const totalOrders = await prisma_1.default.order.count({ where: { status: 'COMPLETED' } });
        // Revenue calculations
        const completedOrders = await prisma_1.default.order.findMany({
            where: { status: 'COMPLETED' },
            select: { totalAmount: true },
        });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Latest Orders
        const latestOrders = await prisma_1.default.order.findMany({
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
    }
    catch (error) {
        console.error('Admin analytics error:', error);
        res.status(500).json({ error: 'Server error compiling analytical trends.' });
    }
});
// 2. User Management
router.get('/users', async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error loading users.' });
    }
});
router.put('/users/:id', async (req, res) => {
    try {
        const { name, role } = req.body;
        const updated = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { name, role },
        });
        res.json({ message: 'User updated successfully.', user: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error modifying user details.' });
    }
});
router.delete('/users/:id', async (req, res) => {
    try {
        await prisma_1.default.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error deleting user.' });
    }
});
// 3. Course management CRUD
router.post('/courses', async (req, res) => {
    try {
        const { title, description, thumbnail, price, isFree, difficulty, duration, modules } = req.body;
        const newCourse = await prisma_1.default.course.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error creating course.' });
    }
});
router.put('/courses/:id', async (req, res) => {
    try {
        const { title, description, thumbnail, price, isFree, difficulty, duration, modules } = req.body;
        const updated = await prisma_1.default.course.update({
            where: { id: req.params.id },
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating course.' });
    }
});
router.delete('/courses/:id', async (req, res) => {
    try {
        await prisma_1.default.course.delete({ where: { id: req.params.id } });
        res.json({ message: 'Course deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error deleting course.' });
    }
});
// 4. Service management CRUD
router.post('/services', async (req, res) => {
    try {
        const { name, description, image, price, active } = req.body;
        const newService = await prisma_1.default.service.create({
            data: {
                name,
                description,
                image,
                price: Number(price),
                active: Boolean(active),
            },
        });
        res.status(201).json({ message: 'Service created successfully.', service: newService });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error creating service.' });
    }
});
router.put('/services/:id', async (req, res) => {
    try {
        const { name, description, image, price, active } = req.body;
        const updated = await prisma_1.default.service.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                image,
                price: Number(price),
                active: Boolean(active),
            },
        });
        res.json({ message: 'Service updated successfully.', service: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating service.' });
    }
});
router.delete('/services/:id', async (req, res) => {
    try {
        await prisma_1.default.service.delete({ where: { id: req.params.id } });
        res.json({ message: 'Service deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error deleting service.' });
    }
});
// 5. Blog CRUD
router.post('/blogs', async (req, res) => {
    try {
        const { title, slug, content, featuredImage, category, published } = req.body;
        const authorId = req.user?.id;
        if (!authorId)
            return res.status(401).json({ error: 'Unauthorized.' });
        const newBlog = await prisma_1.default.blog.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error creating blog post.' });
    }
});
router.put('/blogs/:id', async (req, res) => {
    try {
        const { title, slug, content, featuredImage, category, published } = req.body;
        const updated = await prisma_1.default.blog.update({
            where: { id: req.params.id },
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating blog post.' });
    }
});
router.delete('/blogs/:id', async (req, res) => {
    try {
        await prisma_1.default.blog.delete({ where: { id: req.params.id } });
        res.json({ message: 'Blog post deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error deleting blog post.' });
    }
});
// 6. CSV Export of Sales Data
router.get('/export/orders', async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
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
    }
    catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Server error compiling CSV transaction download.' });
    }
});
exports.default = router;
