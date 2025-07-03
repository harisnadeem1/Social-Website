
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import InfoPageLayout from '@/components/info/InfoPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ContactPage = () => {
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message Sent! 📬",
      description: "Thank you for reaching out. We'll get back to you as soon as possible.",
    });
    e.target.reset();
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Liebenly</title>
        <meta name="description" content="Get in touch with the Liebenly team. We're here to help with any questions, feedback, or support you need." />
      </Helmet>
      <InfoPageLayout
        title="Get in Touch"
        subtitle="We’d love to hear from you! Whether you have a question, feedback, or need support, our team is ready to help."
      >
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6 text-gray-700">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-pink-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">General Inquiries</h3>
                  <a href="mailto:hello@liebenly.com" className="text-purple-600 hover:underline">liebenlysupport@gmail.com</a>
                </div>
              </div>
              {/* <div className="flex items-start">
                <Phone className="w-6 h-6 text-pink-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Phone Support</h3>
                  <p>+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500">(Mon-Fri, 9am-5pm EST)</p>
                </div>
              </div> */}
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-pink-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Our Office</h3>
                  <p>30 N GOULD ST STE 9240</p>
                  <p>SHERIDAN, WY 82801, USA</p>
                </div>

              </div>
            </div>
          </motion.div>
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Your Name" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" type="text" placeholder="How can we help?" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  rows="5"
                  placeholder="Your message..."
                  required
                  className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                ></textarea>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                Send Message
              </Button>
            </form>
          </motion.div> */}
        </div>
      </InfoPageLayout>

    </>
  );
};

export default ContactPage;
