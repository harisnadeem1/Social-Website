
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Briefcase, Code, HeartPulse } from 'lucide-react';
import InfoPageLayout from '@/components/info/InfoPageLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CareersPage = () => {
  const { toast } = useToast();

  const jobOpenings = [
    { title: 'Senior Frontend Engineer', location: 'Remote', department: 'Engineering' },
    { title: 'Product Manager - Growth', location: 'New York, NY', department: 'Product' },
    { title: 'Community Manager', location: 'Remote', department: 'Marketing' },
    { title: 'Data Scientist', location: 'San Francisco, CA', department: 'Data' },
  ];

  const handleApply = () => {
    toast({
      title: "🚧 Feature not implemented",
      description: "This job application feature isn't ready yet, but thanks for your interest!",
    });
  };

  return (
    <>
      <Helmet>
        <title>Careers - Liebenly</title>
        <meta name="description" content="Join the Liebenly team and help us build the future of online dating. Explore our open positions and company culture." />
      </Helmet>
      <InfoPageLayout
        title="Join Our Team"
        subtitle="Help us connect hearts and build the future of dating. We're looking for passionate people to join our mission."
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>
            At Liebenly, we're more than just a company; we're a community of innovators and romantics dedicated to making a real impact. We believe that our work can change lives by helping people find meaningful connections. If you're driven, creative, and passionate about our mission, we'd love to have you on board.
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-12 text-center">
            <div className="p-6 bg-pink-50 rounded-xl">
              <Briefcase className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Impactful Work</h3>
              <p className="text-gray-600 mt-2">Your contributions will directly shape how millions of people find love.</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <Code className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Innovative Culture</h3>
              <p className="text-gray-600 mt-2">We foster a collaborative environment where new ideas are celebrated.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <HeartPulse className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Great Benefits</h3>
              <p className="text-gray-600 mt-2">We offer competitive salaries, health benefits, and a flexible work environment.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-8 text-center">Current Openings</h2>
          <div className="space-y-6">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-gray-500 mt-1">{job.department} &middot; {job.location}</p>
                </div>
                <Button onClick={handleApply} className="mt-4 sm:mt-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white">Apply Now</Button>
              </motion.div>
            ))}
          </div>
        </div>
      </InfoPageLayout>
    </>
  );
};

export default CareersPage;
  