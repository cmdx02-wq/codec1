import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ailaunchpad.com' },
    update: {},
    create: {
      email: 'admin@ailaunchpad.com',
      name: 'Launchpad Admin',
      role: 'ADMIN',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@ailaunchpad.com' },
    update: {},
    create: {
      email: 'student@ailaunchpad.com',
      name: 'Alex Mercer',
      role: 'USER',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    },
  });

  console.log('Users created:', { admin: admin.email, student: student.email });

  // Create Services
  const servicesData = [
    {
      name: 'AI Automation Integration',
      description: 'Streamline business workflows using Make.com, Zapier, and custom LLM agents to save hundreds of hours of manual labor.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      price: 499.0,
      active: true,
    },
    {
      name: 'AI Website Development',
      description: 'Get a premium, blazing-fast responsive portfolio or business landing page built utilizing cutting-edge AI generation & design systems.',
      image: 'https://images.unsplash.com/photo-1547658719-da2b8116c1d0?auto=format&fit=crop&w=800&q=80',
      price: 299.0,
      active: true,
    },
    {
      name: 'Custom AI Chatbots',
      description: 'Deploy advanced website chat widgets connected directly to your company knowledge base using Retrieval-Augmented Generation (RAG).',
      image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80',
      price: 399.0,
      active: true,
    },
    {
      name: 'Resume & LinkedIn Optimization',
      description: 'Revamp your professional presence with ATS-optimized, high-impact resumes and a high-converting LinkedIn Profile rebuild.',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
      price: 99.0,
      active: true,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.create({
      data: s,
    });
  }

  console.log('Services seeded.');

  // Create Courses
  const coursesData = [
    {
      title: 'AI Freelancing Blueprint',
      description: 'The complete step-by-step framework to launch an active online business using AI systems, finding clients, and scaling monthly billing.',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      price: 199.0,
      isFree: false,
      difficulty: 'Beginner',
      duration: '8 Hours',
      modules: [
        {
          title: 'Module 1: Landing Your First Client',
          lessons: ['Introduction to AI Freelancing', 'Setting up profiles on Upwork & Fiverr', 'Writing proposals that convert'],
        },
        {
          title: 'Module 2: Delivering AI Services',
          lessons: ['Writing prompts for copywriting', 'Setting up basic automation workflows', 'Creating mock portfolios'],
        },
      ],
    },
    {
      title: 'Advanced AI Automations with Make & Zapier',
      description: 'Master workflow automation, API connecting, logic trees, custom database queries, and connecting custom LLMs for enterprise automation setups.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      price: 299.0,
      isFree: false,
      difficulty: 'Advanced',
      duration: '12 Hours',
      modules: [
        {
          title: 'Module 1: Webhook & JSON Parsing',
          lessons: ['Understanding Webhook structures', 'Handling JSON objects', 'Connecting REST APIs to Make.com'],
        },
        {
          title: 'Module 2: Error Handling & Databases',
          lessons: ['Routing errors gracefully', 'Saving outputs to PostgreSQL', 'Building recursive loops'],
        },
      ],
    },
    {
      title: 'Introduction to Prompt Engineering',
      description: 'Learn the fundamentals of structuring prompts, few-shot prompting, chain-of-thought logic, and building functional bots.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      price: 0.0,
      isFree: true,
      difficulty: 'Beginner',
      duration: '2 Hours',
      modules: [
        {
          title: 'Module 1: Prompt Syntax',
          lessons: ['Role prompting basics', 'Injecting variable inputs', 'Context separation techniques'],
        },
        {
          title: 'Module 2: Formatting Outputs',
          lessons: ['Getting strict JSON responses', 'Formatting tables and markdown', 'Refining temperature bounds'],
        },
      ],
    },
  ];

  for (const c of coursesData) {
    await prisma.course.create({
      data: c,
    });
  }

  console.log('Courses seeded.');

  // Create Blogs
  const blogsData = [
    {
      title: 'Top 5 AI Skills Clients are Paying for in 2026',
      slug: 'top-5-ai-skills-clients-paying-2026',
      content: `## The AI Freelance Boom
The landscape of digital freelancing has changed permanently. Clients are no longer just looking for content writers or simple web developers. They want **efficiency specialists** who can integrate artificial intelligence into their businesses.

Here are the top 5 skills in high demand right now:

### 1. Make.com Workflow Automation
Businesses are losing thousands of hours manually copying data between tools. Setting up Make.com workflows that sync CRMs, email sequences, and databases with AI processors is highly lucrative.

### 2. Custom GPT & Assistant Integration
Many businesses want a chatbot trained specifically on their files, docs, and handbooks to serve internally or to support users.

### 3. AI-Assisted Front-end Speedrunning
Using toolsets to wire mockups, write initial code, and publish landing pages in hours instead of weeks.

### 4. SEO Semantic Cluster Content Planning
Using semantic clustering algorithms and prompt pipelines to generate cohesive outlines and copy.

### 5. Chatbot Lead Collection
Replacing boring standard lead forms with interactive conversational agents that collect, validate, and inject information directly to CRM pipes.

*Ready to start? Pick a path and build your portfolio!*`,
      featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      category: 'Freelancing',
      published: true,
      authorId: admin.id,
    },
  ];

  for (const b of blogsData) {
    await prisma.blog.create({
      data: b,
    });
  }

  console.log('Blogs seeded.');
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
