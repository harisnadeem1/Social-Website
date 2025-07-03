import { Helmet } from 'react-helmet';
import { Heart, Menu, Facebook, Twitter, Instagram } from 'lucide-react';

import { Link } from 'react-router-dom';
import InfoPageLayout from '@/components/info/InfoPageLayout';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Liebenly</title>
        <meta name="description" content="Read the Liebenly Privacy Policy to understand how we collect, use, and protect your personal information." />
      </Helmet>
      <InfoPageLayout
        title="Privacy Policy"
        subtitle="Your privacy is critically important to us. Last updated: July 3, 2025"
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>
            Welcome to Liebenly ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@liebenly.com.
          </p>
          
          <h2>1. What Information Do We Collect?</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul>
            <li><strong>Personal Information Provided by You.</strong> We collect names; phone numbers; email addresses; mailing addresses; job titles; usernames; passwords; contact preferences; contact or authentication data; billing addresses; debit/credit card numbers; and other similar information.</li>
            <li><strong>Profile Information.</strong> We collect photos, interests, personal bio, location, and other details you choose to add to your profile.</li>
          </ul>

          <h2>2. How Do We Use Your Information?</h2>
          <p>
            We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To respond to user inquiries/offer support to users.</li>
          </ul>

          <h2>3. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, Legal Obligations.
          </p>

          <h2>4. How Do We Keep Your Information Safe?</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information.
          </p>

          <h2>5. How Can You Contact Us About This Policy?</h2>
          <p>
            If you have questions or comments about this notice, you may email us at privacy@liebenly.com or by post to:
          </p>
        <p>
  SCALABLE INSIGHTS LLC<br />
  Attn: Privacy Officer<br />
  30 N GOULD ST STE 9240<br />
  SHERIDAN, WY 82801<br />
  USA
</p>

        </div>
      </InfoPageLayout>
      
    </>
  );
};

export default PrivacyPolicyPage;
  