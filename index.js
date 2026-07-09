"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Route imports
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const courses_1 = __importDefault(require("./routes/courses"));
const services_1 = __importDefault(require("./routes/services"));
const blogs_1 = __importDefault(require("./routes/blogs"));
const payments_1 = __importDefault(require("./routes/payments"));
const marketing_1 = __importDefault(require("./routes/marketing"));
const admin_1 = __importDefault(require("./routes/admin"));
// Load environment variables
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// Serving uploaded files static assets
app.use('/uploads', express_1.default.static(path.join(__dirname, '../../public/uploads')));
// Routes Registration
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/services', services_1.default);
app.use('/api/blogs', blogs_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/marketing', marketing_1.default);
app.use('/api/admin', admin_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    res.status(500).json({ error: err.message || 'Something went wrong inside the server!' });
});
// App Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`  AI LaunchPad Express API running on port ${PORT}`);
    console.log(`==================================================\n`);
});
