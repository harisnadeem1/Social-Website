
import React from 'react';
import { Helmet } from 'react-helmet';
import InfoPageLayout from '@/components/info/InfoPageLayout';

const CookiePolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - Liebenly</title>
        <meta name="description" content="Learn about how Liebenly uses cookies to improve your experience on our dating platform." />
      </Helmet>
      <InfoPageLayout
        title="Cookie Policy"
        subtitle="How we use cookies to provide and improve our services. Last updated: July 3, 2025"
      >
        <div className="prose prose-lg max-w-none text-gray-700">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>
            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
          </p>
          <ul>
            <li>
              <strong>Account related cookies:</strong> If you create an account with us, then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out; however, in some cases, they may remain afterward to remember your site preferences when logged out.
            </li>
            <li>
              <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
            </li>
            <li>
              <strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences, we need to set cookies so that this information can be called whenever you interact with a page.
            </li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>
            In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site. This site uses Google Analytics, which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience.
          </p>

          <h2>4. Disabling Cookies</h2>
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.
          </p>

          <h2>5. More Information</h2>
          <p>
            Hopefully, that has clarified things for you. If you are still looking for more information, then you can contact us through one of our preferred contact methods:
          </p>
          <p>Email: cookies@liebenly.com</p>
        </div>
      </InfoPageLayout>
    </>
  );
};

export default CookiePolicyPage;
  