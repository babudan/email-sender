const { google } = require("googleapis");
const nodemailer = require("nodemailer");
require('dotenv').config();
/*POPULATE BELOW FIELDS WITH YOUR CREDETIALS*/

const CLIENT_ID = "90256456245-qa8hhisa4ad7m55t9ua6m24etabs7i1o.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//04_7-uiGLd-YWCgYIARAAGAQSNwF-L9IrLcfu1_tH7UucSqCKsngrO4ES7y2dsW1y1lMndOVJI8mEF7LEHXQUA8SfhJthqJDM1sI";
const REDIRECT_URI = "https://developers.google.com/oauthplayground" //DONT EDIT THIS
const MY_EMAIL = "hridoydan99@gmail.com";

/*POPULATE ABOVE FIELDS WITH YOUR CREDETIALS*/

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//YOU CAN PASS MORE ARGUMENTS TO THIS FUNCTION LIKE CC, TEMPLATES, ATTACHMENTS ETC. IM JUST KEEPING IT SIMPLE
const sendTestEmail = async (to) => {
  try {
    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MY_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    //EMAIL OPTIONS
    const from = MY_EMAIL;
    const subject = "🌻 This Is Sent By NodeMailer 🌻";
    const html = `
    <p>Hey ${to},</p>
    <p>🌻 This Is A Test Mail Sent By NodeMailer 🌻</p>
    <p>Thank you</p>
    `;
    const info = await transport.sendMail({ from, subject, to, html, labelIds: ["INBOX"] });
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

const automateMailSending = async (recipientEmail, durationInSeconds) => {
  const sendEmailsInterval = () => {
    return new Promise(resolve => {
      // Random interval between 45 and 120 seconds
      const interval = Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000;

      // Call the function to send emails after the random interval
      setTimeout(async () => {
        await sendTestEmail(recipientEmail)
        // Repeat the process after the random interval
        resolve();
      }, interval);
    });
  };

  let elapsedTime = 0;

  const stopProcess = () => {
    console.log('Stopping email-sending process after', durationInSeconds, 'seconds');
    clearInterval(intervalId);
  };
  const intervalId = setInterval(async () => {
    await sendEmailsInterval();
    elapsedTime += 1;

    if (elapsedTime >= durationInSeconds) {
      stopProcess();
    }
  }, 40000); // Run every second

  // Allow the initial interval to start before returning
  await sendEmailsInterval();

};


// Function to check if the thread is from a new sender
const isThreadFromNewSender = async function isthreadfromsender(gmail, thread, knownSenders) {
  // Retrieve the first message in the thread
  const response = await gmail.users.messages.get({
    userId: 'me',
    id: thread.id,
  });

  const message = response.data;
  const senderEmail = message.payload.headers.find((header) => header.name === 'From').value;
  // Check if the sender is already known
  console.log(knownSenders, senderEmail, "88888888")
  if (knownSenders.has(senderEmail)) {
    return false; // Not a new sender
  } else {
    // Check if you've sent an email to this sender
    const sentEmails = await gmail.users.messages.list({
      userId: 'me',
      q: `from: ${"hridoydan99@gmail.com"} to: ${senderEmail}`,
    });

    if (sentEmails.data.resultSizeEstimate > 0) {
      console.log(senderEmail, "4")
      knownSenders.add(senderEmail);
      return false; // Not a new sender
    } else {
      // Add the sender to the known senders set for future reference
      console.log(senderEmail, "3")
      // let emailsend = await sendTestEmail(senderEmail);
      let emailsend = await automateMailSending(senderEmail, 120)
      console.log(emailsend, "666666666")
      knownSenders.add(senderEmail);
      return true; // New sender
    }
  }
}


const fetchGmailLabels = async (refreshToken, maxresults) => {
  try {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      "90256456245-qa8hhisa4ad7m55t9ua6m24etabs7i1o.apps.googleusercontent.com",
      "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",
      "https://developers.google.com/oauthplayground"
    );

    // Set up the Gmail API
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const knownSenders = new Set();

    // Retrieve your inbox
    const response = await gmail.users.threads.list({
      userId: 'me',
      maxResults: maxresults,
    });
    const threads = response.data.threads;

    if (threads) {
      for (const thread of threads) {
        // Check if the thread is from a new sender
        const isNewSender = await isThreadFromNewSender(gmail, thread, knownSenders);
        console.log(isNewSender)
        if (isNewSender) {
          // Process the thread and take appropriate action
          console.log('New sender found in thread:', thread);
          // return true;
        }
      }
    } else {
      console.log('No threads found in your inbox.');
      return false;
    }

  } catch (err) {
    console.error("Error fetching labels:", err);
    throw err;
  }
};


// async function findAndProcessNewSenders() {
//   // Set up your Gmail API client with authentication
//   const gmail = google.gmail({
//     version: 'v1',
//     auth: yourAuthenticatedClient,
//   });

//   // Create a storage mechanism to track sender information
//   const knownSenders = new Set();

//   try {
//     // Retrieve your inbox
//     const response = await gmail.users.threads.list({
//       userId: 'me',
//     });

//     const threads = response.data.threads;

//     if (threads) {
//       for (const thread of threads) {
//         // Check if the thread is from a new sender
//         const isNewSender = await isThreadFromNewSender(gmail, thread, knownSenders);

//         if (isNewSender) {
//           // Process the thread and take appropriate action
//           console.log('New sender found in thread:', thread.id);
//         }
//       }
//     } else {
//       console.log('No threads found in your inbox.');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }




module.exports = { sendTestEmail, fetchGmailLabels };
