"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Get all active services
router.get('/', async (req, res) => {
    try {
        const services = await prisma_1.default.service.findMany({
            where: { active: true },
            orderBy: { price: 'asc' },
        });
        res.json(services);
    }
    catch (error) {
        console.error('Fetch services error:', error);
        res.status(500).json({ error: 'Server error fetching services.' });
    }
});
// Get a single service
router.get('/:id', async (req, res) => {
    try {
        const service = await prisma_1.default.service.findUnique({
            where: { id: req.params.id },
        });
        if (!service) {
            return res.status(404).json({ error: 'Service not found.' });
        }
        res.json(service);
    }
    catch (error) {
        console.error('Fetch service error:', error);
        res.status(500).json({ error: 'Server error loading service details.' });
    }
});
exports.default = router;
