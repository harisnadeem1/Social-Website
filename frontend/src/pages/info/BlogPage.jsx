
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import InfoPageLayout from '@/components/info/InfoPageLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const BlogPage = () => {
  const { toast } = useToast();

  const blogPosts = [
    {
      title: 'The Art of the First Message: How to Stand Out',
      author: 'Jane Doe',
      date: 'July 3, 2025',
      excerpt: 'Tired of sending messages into the void? We break down the science and art of crafting an opening line that gets a reply.',
      img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216',
      category: 'Dating Tips'
    },
    {
      title: '5 Profile Picture Mistakes to Avoid at All Costs',
      author: 'John Smith',
      date: 'June 28, 2025',
      excerpt: 'Your profile picture is your first impression. Make sure it’s a great one by avoiding these common pitfalls.',
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      category: 'Profile Advice'
    },
    {
      title: 'Navigating the First Date: A Guide to Success',
      author: 'Emily White',
      date: 'June 21, 2025',
      excerpt: 'From choosing the perfect spot to keeping the conversation flowing, here’s everything you need to know for a successful first date.',
      img: 'https://images.unsplash.com/photo-1556742044-53c242b6aa33',
      category: 'Relationships'
    },
  ];

  const handleReadMore = () => {
    toast({
      title: "🚧 Blog post coming soon!",
      description: "This article is still being written. Check back later!",
    });
  };

  return (
    <>
      <Helmet>
        <title>Blog - Liebenly</title>
        <meta name="description" content="Dating tips, relationship advice, and success stories from the Liebenly blog. Your guide to modern love." />
      </Helmet>
      <InfoPageLayout
        title="The Liebenly Blog"
        subtitle="Your source for dating advice, relationship insights, and success stories from our community."
      >
        <div className="space-y-12">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="grid md:grid-cols-3 gap-8 items-center"
            >
              <div className="md:col-span-1">
                <img  class="w-full h-48 object-cover rounded-lg shadow-md" alt={`Blog post image for ${post.title}`} src="https://images.unsplash.com/photo-1621165031056-2fb2961935d1" />
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide">{post.category}</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-3">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <p>By {post.author} on {post.date}</p>
                  <Button variant="link" onClick={handleReadMore} className="text-purple-600 hover:text-purple-800 p-0">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </InfoPageLayout>
    </>
  );
};

export default BlogPage;
  