import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anime - Watch and Discover',
  description: 'Discover and watch your favorite anime series and movies',
};

export default function AnimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}