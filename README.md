# Developer Portfolio

A minimal, modern developer portfolio with an integrated blog built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Clean Portfolio Design** - Showcase your skills, projects, and experience
- **Integrated Blog** - Share your thoughts and technical insights
- **Responsive Design** - Looks great on all devices
- **Modern Tech Stack** - Built with Next.js 15, TypeScript, and Tailwind CSS
- **Database Integration** - Prisma ORM with PostgreSQL for blog posts
- **Authentication** - Optional user authentication for blog comments
- **SEO Optimized** - Built-in SEO best practices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based auth
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd developer-portfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .template.env .env
   ```
   Fill in your database URL and other required environment variables.

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Customization

### Personal Information
- Update the hero section in `src/app/page.tsx`
- Modify social links and contact information
- Add your own projects in the projects section

### Blog Content
- Create blog posts through the admin interface (if authentication is enabled)
- Or directly add posts to your database

### Styling
- Customize colors and fonts in `tailwind.config.js`
- Modify component styles in the respective component files

## Database Commands

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## License

MIT License - feel free to use this template for your own portfolio!
