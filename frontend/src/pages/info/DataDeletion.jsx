import { Helmet } from 'react-helmet';
import InfoPageLayout from '@/components/info/InfoPageLayout';

const DataDeletionPage = () => {
  return (
    <>
      <Helmet>
        <title>Data Deletion Instructions - Liebenly</title>
        <meta
          name="description"
          content="Learn how to request deletion of your personal data from Liebenly."
        />
      </Helmet>
      <InfoPageLayout
        title="Data Deletion Instructions"
        subtitle="How to request removal of your personal information. Last updated: August 6, 2025"
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <p>
            At Liebenly, we respect your right to privacy and provide you with the option to delete your personal information from our systems at any time.
          </p>

          <h2>How to Request Data Deletion</h2>
          <p>
            If you wish to delete your account and all associated personal data, please follow one of these methods:
          </p>
          <ul>
            <li>
              <strong>Email Request:</strong> Send an email to{" "}
              <a href="mailto:privacy@liebenly.com" className="text-pink-600">
                privacy@liebenly.com
              </a>{" "}
              with the subject line “Data Deletion Request”. Please include your registered email address in the message.
            </li>
            <li>
              <strong>In-App Request:</strong> Go to <em>Settings → Privacy → Delete Account</em> inside the Liebenly app and follow the on-screen instructions.
            </li>
          </ul>

          <h2>What Happens Next?</h2>
          <p>
            Once we receive your request, we will verify your identity and process the deletion within 7 business days. This will remove your account, profile, messages, and any other personal data stored on our platform.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our data deletion process, please email us at{" "}
            <a href="mailto:privacy@liebenly.com" className="text-pink-600">
              privacy@liebenly.com
            </a>
            .
          </p>
        </div>
      </InfoPageLayout>
    </>
  );
};

export default DataDeletionPage;
