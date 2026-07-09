import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authenticateJWT } from '../middleware/auth';

const router = Router();

// 1. Stripe Checkout Session / Mock payment creator
router.post('/checkout', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, serviceId, provider, couponCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!courseId && !serviceId) {
      return res.status(400).json({ error: 'Please specify a courseId or serviceId to purchase.' });
    }

    let price = 0;
    let title = '';

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ error: 'Course not found.' });
      price = course.price;
      title = course.title;
    } else if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) return res.status(404).json({ error: 'Service not found.' });
      price = service.price;
      title = service.name;
    }

    // Apply mock discount code if provided
    let finalPrice = price;
    if (couponCode === 'LAUNCH50') {
      finalPrice = price * 0.5; // 50% off
    }

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId,
        courseId: courseId || null,
        serviceId: serviceId || null,
        totalAmount: finalPrice,
        status: 'PENDING',
        couponId: couponCode || null,
      },
    });

    // Check environment for Stripe/Razorpay credentials. If not set, run mock success immediately
    const useMock = !process.env.STRIPE_SECRET_KEY && !process.env.RAZORPAY_KEY_SECRET;

    if (useMock || provider === 'FREE' || finalPrice === 0) {
      // Execute local mock checkout fulfillment
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: finalPrice,
          currency: 'USD',
          status: 'SUCCESS',
          provider: finalPrice === 0 ? 'FREE' : 'STRIPE',
          providerPaymentId: `mock-pay-${Date.now()}`,
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          message: `Payment successful! You have unlocked: "${title}".`,
        },
      });

      return res.json({
        success: true,
        mock: true,
        orderId: order.id,
        message: 'Mock payment processed successfully!',
      });
    }

    if (provider === 'STRIPE') {
      // In production we would do:
      // const session = await stripe.checkout.sessions.create({...})
      // For clean execution, we provide checkout configuration
      const mockStripeSessionId = `cs_test_${Date.now()}`;
      
      // Let's create a payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: finalPrice,
          currency: 'USD',
          status: 'PENDING',
          provider: 'STRIPE',
          providerPaymentId: mockStripeSessionId,
        },
      });

      return res.json({
        success: true,
        checkoutUrl: `/payment-simulation?sessionId=${mockStripeSessionId}&orderId=${order.id}`,
        sessionId: mockStripeSessionId,
      });
    }

    if (provider === 'RAZORPAY') {
      const mockRazorpayOrderId = `order_rzp_${Date.now()}`;
      
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: finalPrice,
          currency: 'INR',
          status: 'PENDING',
          provider: 'RAZORPAY',
          providerOrderId: mockRazorpayOrderId,
        },
      });

      return res.json({
        success: true,
        razorpayOrderId: mockRazorpayOrderId,
        amount: finalPrice * 100, // Razorpay works in paise
        currency: 'INR',
        orderId: order.id,
      });
    }

    return res.status(400).json({ error: 'Invalid payment provider requested.' });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Server error setting up payment transaction.' });
  }
});

// 2. Simulating Complete Payment (Used by frontend dev interface to mock webhook callbacks)
router.post('/simulate-complete', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { course: true, service: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status === 'COMPLETED') {
      return res.json({ success: true, message: 'Order is already completed.' });
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    // Update pending payments
    await prisma.payment.updateMany({
      where: { orderId, status: 'PENDING' },
      data: { status: 'SUCCESS', providerPaymentId: `sim-pay-${Date.now()}` },
    });

    const itemTitle = order.course?.title || order.service?.name || 'Product';

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        message: `Success! Your purchase of "${itemTitle}" has been verified.`,
      },
    });

    res.json({ success: true, message: 'Payment simulation succeeded. Order unlocked!' });
  } catch (error: any) {
    console.error('Simulate complete error:', error);
    res.status(500).json({ error: 'Server error completing simulated checkout.' });
  }
});

export default router;
