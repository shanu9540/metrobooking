const Razorpay = require('razorpay');

let razorpayInstance = null;
const isMock = process.env.RAZORPAY_KEY_ID === 'mock' || !process.env.RAZORPAY_KEY_ID;

if (!isMock) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized in ACTIVE mode.');
  } catch (error) {
    console.error('Error initializing Razorpay, falling back to mock:', error.message);
    razorpayInstance = null;
  }
} else {
  console.log('Razorpay initialized in MOCK mode.');
}

module.exports = {
  razorpay: razorpayInstance,
  isMock
};
