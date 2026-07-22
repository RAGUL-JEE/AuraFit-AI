import fetch from 'node-fetch'; // Polyfill if node version < 18, but typically global fetch works. Since this is esbuild node, we can rely on standard fetch or import if needed. We'll use the native fetch.
// Actually, Express server runs in Node. Let's use standard global fetch if available or dynamically import.
// For Node 18+, fetch is built-in.

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailOptions {
  to: { email: string; name: string }[];
  subject: string;
  htmlContent: string;
}

const sendBrevoEmail = async (options: EmailOptions) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('BREVO_API_KEY is not defined in environment variables.');
    throw new Error('BREVO_API_KEY is missing');
  }

  const payload = {
    sender: { 
      name: process.env.SENDER_NAME || 'AuraFit AI', 
      email: process.env.SENDER_EMAIL || 'noreply@aurafit.ai' 
    },
    to: options.to,
    subject: options.subject,
    htmlContent: options.htmlContent,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Brevo API Error:', errBody);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Email sent successfully via Brevo:', data);
    return data;
  } catch (error) {
    console.error('Error sending Brevo email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  return sendBrevoEmail({
    to: [{ email, name }],
    subject: 'Welcome to AuraFit AI',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #333; max-w-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF3131;">Welcome to AuraFit AI, ${name}!</h2>
        <p>We are thrilled to have you join our elite performance journey. Your account has been successfully created.</p>
        <p>Start your first workout today and let our AI coach guide you to perfect form.</p>
        <br/>
        <p>Stay strong,</p>
        <p><strong>The AuraFit AI Team</strong></p>
      </div>
    `,
  });
};

export const sendWorkoutCompletionEmail = async (email: string, name: string, stats: any) => {
  return sendBrevoEmail({
    to: [{ email, name }],
    subject: 'Workout Completed - Great Job!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF3131;">Great job, ${name}!</h2>
        <p>You just crushed another workout with AuraFit AI.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Workout Stats</h3>
          <ul>
            <li><strong>Duration:</strong> ${Math.floor(stats.duration / 60)} mins ${stats.duration % 60} secs</li>
            <li><strong>Calories Burned:</strong> ${stats.calories} kcal</li>
            <li><strong>Total Reps:</strong> ${stats.reps}</li>
            <li><strong>Form Accuracy:</strong> ${stats.accuracy}%</li>
          </ul>
        </div>
        <p>Keep up the amazing work and momentum!</p>
        <br/>
        <p>Stay strong,</p>
        <p><strong>The AuraFit AI Team</strong></p>
      </div>
    `,
  });
};

export const sendWeeklyProgressEmail = async (email: string, name: string, progressStats: any) => {
  return sendBrevoEmail({
    to: [{ email, name }],
    subject: 'Your AuraFit AI Weekly Progress',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF3131;">Weekly Progress Report</h2>
        <p>Hi ${name}, here is your performance breakdown for the week.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">This Week's Achievements</h3>
          <ul>
            <li><strong>Workouts Completed:</strong> ${progressStats.totalWorkouts}</li>
            <li><strong>Total Calories Burned:</strong> ${progressStats.totalCalories} kcal</li>
            <li><strong>Current Streak:</strong> ${progressStats.streak} days</li>
            <li><strong>Average Form Accuracy:</strong> ${progressStats.avgAccuracy}%</li>
          </ul>
        </div>
        <p>Review your detailed analytics in the AuraFit AI dashboard.</p>
        <br/>
        <p>Stay strong,</p>
        <p><strong>The AuraFit AI Team</strong></p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, name: string) => {
  // Mock reset link for demonstration
  const resetLink = 'https://aurafit.ai/reset-password?token=mock-token-123';
  return sendBrevoEmail({
    to: [{ email, name: name || 'AuraFit Athlete' }],
    subject: 'AuraFit AI - Password Reset Request',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF3131;">Password Reset</h2>
        <p>Hello ${name || 'Athlete'},</p>
        <p>We received a request to reset your password for your AuraFit AI account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #FF3131; color: #fff; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br/>
        <p>Stay strong,</p>
        <p><strong>The AuraFit AI Team</strong></p>
      </div>
    `,
  });
};
