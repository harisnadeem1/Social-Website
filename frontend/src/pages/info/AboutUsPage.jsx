
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Heart, Users, Globe } from 'lucide-react';
import InfoPageLayout from '@/components/info/InfoPageLayout';

const AboutUsPage = () => {
  const teamMembers = [
    { name: 'Alex Johnson', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a' },
    { name: 'Maria Garcia', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
    { name: 'Sam Chen', role: 'Lead Engineer', img: 'https://images.unsplash.com/photo-1557862921-37829c790f19' },
    { name: 'Jessica Taylor', role: 'Marketing Director', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' },
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Liebenly</title>
        <meta name="description" content="Learn about Liebenly's mission to create meaningful connections and the team dedicated to helping you find love." />
      </Helmet>
      <InfoPageLayout
        title="Our Story"
        subtitle="We believe everyone deserves to find love. Discover the mission and passion behind Liebenly."
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead">
            In a world of fleeting connections, Liebenly was born from a simple yet powerful idea: to create a space where genuine relationships can blossom. We were tired of the endless swiping and superficial interactions that dominate modern dating. We envisioned a platform that prioritizes authenticity, meaningful conversations, and real, lasting love.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Our mission is to foster a community where individuals can connect on a deeper level. We leverage thoughtful design and innovative technology to help you discover not just a match, but a partner. We're committed to creating a safe, inclusive, and supportive environment for everyone on their journey to find love.
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-12 text-center">
            <div className="p-6 bg-pink-50 rounded-xl">
              <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Genuine Connections</h3>
              <p className="text-gray-600 mt-2">We focus on quality over quantity, encouraging authentic profiles and conversations.</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Inclusive Community</h3>
              <p className="text-gray-600 mt-2">Liebenly is a welcoming space for people of all backgrounds, orientations, and identities.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Global Reach</h3>
              <p className="text-gray-600 mt-2">Connecting hearts across cities and countries, helping you find love anywhere.</p>
            </div>
          </div>

          {/* <h2>Meet the Team</h2>
          <p>
            We are a passionate team of developers, designers, and dreamers dedicated to revolutionizing the way people connect. Our diverse backgrounds and shared vision drive us to build the best possible dating experience for you.
          </p> */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <img  class="w-24 h-24 rounded-full mx-auto mb-3 shadow-lg object-cover" alt={`Team member ${member.name}`} src="https://images.unsplash.com/photo-1691437155211-6986ef08cf27" />
                <h4 className="font-semibold text-gray-800">{member.name}</h4>
                <p className="text-sm text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div> */}
        </div>
      </InfoPageLayout>
    </>
  );
};

export default AboutUsPage;
  