import Link from "next/link";
import { Container } from "@/components/layout";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Mail } from "lucide-react";
import type { PublicPost } from "@/lib/blog/types";

export default async function Home() {
  const postsResult = await getAllPosts(false);
  const recentPosts = postsResult.posts?.slice(0, 2) || [];

  return (
    <Container size="md">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Hi, I'm vWinter
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Welcome to my portfolio and blog.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <Link 
              href="https://github.com/v1rtualWinter" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <GitHubLogoIcon className="h-5 w-5" />
            </Link>
            
            <Link 
              href="mailto:me@vwinter.moe"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section className="py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Recent Posts</h2>
            <Link 
              href="/blog" 
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-6">
            {recentPosts.map((post: PublicPost) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
