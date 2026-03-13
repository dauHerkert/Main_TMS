const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.RESET_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.SENDGRID_API_KEY || !process.env.RESET_FROM_EMAIL) {
      throw new Error('Missing required environment variables');
    }

    const { email } = JSON.parse(event.body || '{}');
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    const actionCodeSettings = {
      url: 'https://www.porsche-tennis.com/en/login',
      handleCodeInApp: false,
    };

    const resetLink = await admin
      .auth()
      .generatePasswordResetLink(normalizedEmail, actionCodeSettings);

    await sgMail.send({
      to: normalizedEmail,
      from: {
        email: process.env.RESET_FROM_EMAIL,
        name: process.env.RESET_FROM_NAME,
      },
      subject: 'Reset your password',
      text: `Hello,\n\nFollow this link to reset your password:\n\n${resetLink}\n\nIf you didn’t request this, you can ignore this email.`,
      html: `
        <p>Hello,</p>
        <p>Follow this link to reset your password:</p>
        <p><a href="${resetLink}">Reset password</a></p>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    const errorCode = error?.code || error?.response?.body?.errors?.[0]?.message || 'unknown_error';
    const errorMessage = error?.message || 'Unexpected error';
    console.error('send-reset-password error:', { errorCode, errorMessage });

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        error: 'Reset email could not be sent',
        code: errorCode,
      }),
    };
  }
};
