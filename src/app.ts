import express, { Request, Response, Express } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors'
const prisma = new PrismaClient();
const app: Express = express();

app.use(express.json());

app.use(cors())

// Interface for user request body
interface UserInput {
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
}

// Interface for post request body
interface PostInput {
  title: string;
  content: string;
  published?: boolean;
  authorId: number;
}

// --- User CRUD Routes ---

// Create a user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, role }: UserInput = req.body;
    const user = await prisma.user.create({
      data: { name, email, role: role || 'USER' },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get all users (with optional posts)
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { posts: req.query.includePosts === 'true' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get a single user (with optional posts)
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { posts: req.query.includePosts === 'true' },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update a user
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { name, email, role }: UserInput = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email, role },
    });
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(400).json({ error: 'User not found' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Delete a user
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// --- Post CRUD Routes ---

// Create a post
app.post('/posts', async (req: Request, res: Response) => {
  try {
    const { title, content, published, authorId }: PostInput = req.body;
    const post = await prisma.post.create({
      data: { title, content, published: published || false, authorId },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get all posts
app.get('/posts', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: req.query.includeAuthor === 'true' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/', (req:Request, res:Response) => {
  res.send('Hello from Vercel!');
});

// Get a single post
app.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { author: req.query.includeAuthor === 'true' },
    });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update a post
app.put('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, published, authorId }: PostInput = req.body;
    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: { title, content, published, authorId },
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete a post
app.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Export app and prisma for server.ts
export { app, prisma };
