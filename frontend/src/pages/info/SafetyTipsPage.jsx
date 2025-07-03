
import React from 'react';
import { Helmet } from 'react-helmet';
import { ShieldCheck, MessageCircle, Users } from 'lucide-react';
import InfoPageLayout from '@/components/info/InfoPageLayout';

const SafetyTipsPage = () => {
  return (
    <>
      <Helmet>
        <title>Safety Tips - Liebenly</title>
        <meta name="description" content="Your safety is our priority. Read our tips for staying safe while dating online and meeting in person." />
      </Helmet>
      <InfoPageLayout
        title="Dating Safety Tips"
        subtitle="Your safety and security are our top priorities. Here are some tips to help you date safely."
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>
            Meeting new people is exciting, but it’s important to be cautious and mindful of your safety. Follow these tips to help make your Liebenly experience a safe and enjoyable one.
          </p>

          <div className="space-y-8 mt-8">
            <div className="flex items-start">
              <ShieldCheck className="w-10 h-10 text-green-500 mt-1 mr-6 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Protect Your Personal Information</h3>
                <p>Be careful about sharing personal details like your full name, home address, phone number, or place of work in your profile or early conversations. Wait until you trust someone before sharing more sensitive information.</p>
              </div>
            </div>
            <div className="flex items-start">
              <MessageCircle className="w-10 h-10 text-blue-500 mt-1 mr-6 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Stay on the Platform</h3>
                <p>Keep conversations on the Liebenly platform while you’re getting to know someone. Scammers often try to move conversations to text, messaging apps, email, or phone right away. Staying on our platform provides an extra layer of protection.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-10 h-10 text-purple-500 mt-1 mr-6 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Meet in Public and Stay in Public</h3>
                <p>For the first few dates, meet in a populated, public place—never at your home, your date's home, or any other private location. If your date pressures you to go to a private location, end the date.</p>
              </div>
            </div>
          </div>

          <h2 className="mt-12">More Tips for a Safe First Date</h2>
          <ul>
            <li><strong>Tell a friend or family member your plans.</strong> Let someone know who you're meeting, where you're going, and when you expect to be back.</li>
            <li><strong>Arrange your own transportation.</strong> Maintain control over your own ride—to and from the date—so you can leave whenever you want.</li>
            <li><strong>Stay sober.</strong> Don't do anything that would impair your judgment and cause you to make a decision you could regret.</li>
            <li><strong>Trust your instincts.</strong> If you feel uncomfortable, leave. Don't worry about feeling rude; your safety is the most important thing.</li>
          </ul>

          <h2>Reporting & Blocking</h2>
          <p>
            We encourage you to report and block anyone who violates our terms. If you experience any issues, please use the reporting tools within the app or contact our support team immediately. Your reports help us keep the community safe.
          </p>
        </div>
      </InfoPageLayout>
    </>
  );
};

export default SafetyTipsPage;
  