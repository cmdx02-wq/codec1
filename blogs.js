"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all published blogs
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        const whereClause = { published: true };
        if (search) {
            whereClause.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { content: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (category && category !== 'All') {
            whereClause.category = String(category);
        }
        const blogs = await prisma_1.default.blog.findMany({
            where: whereClause,
            include: {
                author: {
                    select: { name: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(blogs);
    }
    catch (error) {
        console.error('Fetch blogs error:', error);
        res.status(500).json({ error: 'Server error fetching blogs.' });
    }
});
// Get blog by slug (with details)
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await prisma_1.default.blog.findUnique({
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
        await prisma_1.default.blog.update({
            where: { id: blog.id },
            data: { viewCount: { increment: 1 } },
        });
        // Fetch related articles (same category, different ID, max 3)
        const related = await prisma_1.default.blog.findMany({
            where: {
                category: blog.category,
                id: { not: blog.id },
                published: true,
            },
            take: 3,
            orderBy: { createdAt: 'desc' },
        });
        res.json({ blog, related });
    }
    catch (error) {
        console.error('Fetch blog detail error:', error);
        res.status(500).json({ error: 'Server error loading blog post.' });
    }
});
// Post comment to a blog post
router.post('/:id/comments', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { content } = req.body;
        const blogId = req.params.id;
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required.' });
        }
        const blog = await prisma_1.default.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found.' });
        }
        const newComment = await prisma_1.default.comment.create({
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
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Server error adding comment.' });
    }
});
exports.default = router;
