
import React from 'react';
import { Helmet } from 'react-helmet';
import InfoPageLayout from '@/components/info/InfoPageLayout';

const TermsAndConditionsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Liebenly</title>
        <meta name="description" content="Read the Liebenly Terms and Conditions. By using our service, you agree to these terms." />
      </Helmet>
      <InfoPageLayout
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before using our service. Last updated: July 3, 2025"
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <h2>1. Agreement to Terms</h2>
          <p>
            By using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2>3. User Conduct</h2>
          <p>
            You agree not to use the Service to:
          </p>
          <ul>
            <li>Upload, post, email, transmit, or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
            <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
            <li>Upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service.</li>
          </ul>

          <h2>4. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at legal@liebenly.com.
          </p>
        </div>
      </InfoPageLayout>
      
    </>
  );
};

export default TermsAndConditionsPage;
  