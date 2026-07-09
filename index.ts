import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Route imports
import authRouter from './routes/auth';
import userRouter from './routes/user';
import courseRouter from './routes/courses';
import serviceRouter from './routes/services';
import blogRouter from './routes/blogs';
import paymentRouter from './routes/payments';
import marketingRouter from './routes/marketing';
import adminRouter from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Serving uploaded files static assets
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Routes Registration
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/services', serviceRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
