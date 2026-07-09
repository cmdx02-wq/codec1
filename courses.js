"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Get all courses (with optional search, level filters)
router.get('/', async (req, res) => {
    try {
        const { search, difficulty } = req.query;
        const whereClause = {};
        if (search) {
            whereClause.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (difficulty && difficulty !== 'All') {
            whereClause.difficulty = String(difficulty);
        }
        const courses = await prisma_1.default.course.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        res.json(courses);
    }
    catch (error) {
        console.error('Fetch courses error:', error);
        res.status(500).json({ error: 'Server error fetching courses.' });
    }
});
// Get a single course details
router.get('/:id', async (req, res) => {
    try {
        const course = await prisma_1.default.course.findUnique({
            where: { id: req.params.id },
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        res.json(course);
    }
    catch (error) {
        console.error('Fetch course error:', error);
        res.status(500).json({ error: 'Server error loading course details.' });
    }
});
exports.default = router;
