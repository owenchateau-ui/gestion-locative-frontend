import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mydb?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Brown',
    },
  });

  console.log('Created users:', { user1, user2, user3 });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Prisma',
      content: 'Prisma is a modern database toolkit that makes database access easy...',
      published: true,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Introduction to PostgreSQL',
      content: 'PostgreSQL is a powerful, open source object-relational database system...',
      published: true,
      authorId: user1.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Docker for Developers',
      content: 'Docker helps developers build, share, and run applications in containers...',
      published: false,
      authorId: user2.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: 'Building REST APIs',
      content: 'REST APIs are the backbone of modern web applications...',
      published: true,
      authorId: user3.id,
    },
  });

  console.log('Created posts:', { post1, post2, post3, post4 });
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
