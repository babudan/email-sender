//create express server
const express = require("express");
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const port = 3010;
const { google } = require("googleapis");
const { sendTestEmail, fetchGmailLabels } = require("./mailer");

const REFRESH_TOKEN = "1//04_7-uiGLd-YWCgYIARAAGAQSNwF-L9IrLcfu1_tH7UucSqCKsngrO4ES7y2dsW1y1lMndOVJI8mEF7LEHXQUA8SfhJthqJDM1sI";

app.get("/", (req, res) => {
  res.send("Run /send-email to send test email");
});


app.get("/send-email", async (req, res) => {
  try {
    let email_numbers = req.query.maxemail;
    const labels = await fetchGmailLabels(REFRESH_TOKEN, email_numbers);
    if (labels) res.send({ labels });
    else req.send({ labels })
  } catch (error) {
    res.send(error);
  }
});





// Configure the Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: '90256456245-qa8hhisa4ad7m55t9ua6m24etabs7i1o.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3010/auth/google/callback' // Update the callback URL accordingly
},
  function (accessToken, refreshToken, profile, done) {
    // You can handle user information here, e.g., save it to a database
    // For simplicity, we'll just return the user profile for this example
    // console.log(profile)
    return done(null, profile);
  }
));

// Initialize Passport
app.use(passport.initialize());

// Define the Google OAuth route for authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

// Callback URL for Google OAuth
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  function (req, res) {
    // Successful authentication, redirect or respond as needed
    res.send('Logged in with Google!');
  }
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
