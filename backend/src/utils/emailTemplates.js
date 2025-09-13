function buildEmailHTML(user) {
  const section = (title, items, label, icon) => {
    if (!items.length) return "";
    return `
      <div style="margin: 32px 0;">
        <h3 style="color: #1f2937; font-size: 20px; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; letter-spacing: -0.025em;">
          <span style="margin-right: 10px; font-size: 22px;">${icon}</span>
          ${title}
        </h3>
        <div style="background: #ffffff; border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;">
          ${items
            .map(
              (i, index) => `
            <a href="https://liebenly.com/profile/${i.profile_id}" 
               style="display: block; text-decoration: none; color: inherit; padding: 20px; ${index < items.length - 1 ? 'border-bottom: 1px solid #f9fafb;' : ''} transition: all 0.2s ease; background-color: #ffffff;"
               onmouseover="this.style.backgroundColor='#fafbfc'"
               onmouseout="this.style.backgroundColor='#ffffff'">
              <table style="width: 100%; border-spacing: 0;">
                <tr>
                  <td style="width: 60px; vertical-align: top;">
                    <img src="${i.profile_image_url}" 
                         width="50" 
                         height="50" 
                         style="border-radius: 12px; object-fit: cover; border: 2px solid #f3f4f6; display: block;" 
                         alt="${i.sender_name}"/>
                  </td>
                  <td style="vertical-align: center; padding-left: 16px;">
                    <div style="font-weight: 700; color: #111827; font-size: 17px; margin-bottom: 4px; letter-spacing: -0.025em;">
                      ${i.sender_name}
                    </div>
                    <div style="color: #6b7280; font-size: 15px; line-height: 1.4;">
                      ${label}
                    </div>
                  </td>
                  <td style="text-align: right; vertical-align: center; width: 24px;">
                    <span style="color: #d1d5db; font-size: 18px;">→</span>
                  </td>
                </tr>
              </table>
            </a>`
            )
            .join("")}
        </div>
      </div>
    `;
  };

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Update - Liebenly</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .header-padding { padding: 32px 20px !important; }
        .content-padding { padding: 32px 20px !important; }
        .stats-flex { flex-direction: column !important; gap: 16px; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.5;">
    <table style="width: 100%; background-color: #f8fafc; margin: 0; padding: 40px 0;" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 48px 40px; text-align: center; position: relative;" class="header-padding">
              <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; display: inline-block; backdrop-filter: blur(20px); margin-bottom: 24px;">
                <table style="margin: 0 auto;" cellpadding="0" cellspacing="0">
                  <tr>
                    
                    <td>
                      <span style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Liebenly</span>
                    </td>
                  </tr>
                </table>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">
                Your Daily Update
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 16px 0 0 0; font-weight: 500;">
                💌 New connections await you
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 48px 40px;" class="content-padding">
              <div style="margin-bottom: 40px; text-align: center;">
                <h2 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.025em;">
                  Hello ${user.name}! 👋
                </h2>
                <p style="color: #6b7280; font-size: 18px; line-height: 1.6; margin: 0; font-weight: 500;">
                  Here's what happened while you were away
                </p>
              </div>

              ${section("New Messages", user.messages, "sent you a message", "💬")}
              ${section("Profile Likes", user.likes, "liked your profile", "❤️")}
              ${section("Winks", user.winks, "winked at you", "😉")}

              

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://liebenly.com" 
                   style="display: inline-block; 
                          padding: 18px 36px; 
                          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); 
                          color: #ffffff; 
                          text-decoration: none; 
                          border-radius: 16px; 
                          font-weight: 700; 
                          font-size: 18px;
                          letter-spacing: -0.025em;
                          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
                          transition: all 0.2s ease;">
                  🚀 Open Liebenly
                </a>
              </div>


            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <div style="margin-bottom: 16px;">
                <table style="margin: 0 auto;" cellpadding="0" cellspacing="0">
                  <tr>
                   
                    <td>
                      <span style="color: #6b7280; font-size: 16px; font-weight: 700;">Liebenly</span>
                    </td>
                  </tr>
                </table>
              </div>
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                You're receiving this because you're a valued Liebenly member
              </p>
              <div style="margin: 16px 0;">
                <a href="https://liebenly.com" style="color: #ec4899; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 12px;">Settings</a>
                <span style="color: #d1d5db;">•</span>
                <a href="https://liebenly.com" style="color: #ec4899; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 12px;">Unsubscribe</a>
              </div>
              <div style="margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2024 Liebenly • Made with ❤️ for meaningful connections
                </p>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

module.exports = { buildEmailHTML };