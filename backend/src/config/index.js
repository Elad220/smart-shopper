// This file no longer needs to load dotenv itself.

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-shopper';
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';
const PORT = process.env.PORT || 3001;

// Validate the encryption key immediately on load
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY is not defined in your backend/.env file or is not a 64-character hex string.');
}

module.exports = {
  ENCRYPTION_KEY,
  MONGODB_URI,
  JWT_SECRET,
  PORT,
};