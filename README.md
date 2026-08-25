# MetroGo - Complete Metro Ticket Booking Web Application

MetroGo is a production-ready, full-stack online metro ticket booking application that calculates shortest paths dynamically, calculates range-based fares in the backend, handles transactions via Razorpay, renders interactive route maps, and generates secure digital tickets with scan-validation codes.

---

## 🚇 Technical Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide Icons, Leaflet Maps
- **Backend**: Node.js, Express, REST APIs, JSON Web Tokens (JWT), Bcrypt, Razorpay Node SDK, QRCode generator, Helmet security, Express Rate Limit
- **Database**: MongoDB with Mongoose (with `2dsphere` indexes for nearby geocoding queries)

---

## 📁 Directory Structure

```
metro-ticket-booking/
├── backend/
│   ├── config/             # DB & payment configurations
│   ├── controllers/        # REST controllers (Auth, Stations, Fares, Bookings, Payments, Tickets, Admin)
│   ├── middleware/         # JWT verification, Admin guards, global error handling
│   ├── models/             # Mongoose schemas (User, Station, Route, Booking, Payment, Ticket, FareConfig)
│   ├── routes/             # REST routing mounts
│   ├── scripts/            # Seed data scripts
│   ├── services/           # Adjacency routing (Dijkstra) & Fare computations
│   ├── tests/              # Supertest & Jest integration tests
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable layout UI, map wrapper, progress indicators
│   │   ├── context/        # Auth & Booking flow providers
│   │   ├── pages/          # Homepage, Checkout, Tickets, Scanner, and Admin dashboard
│   │   ├── services/       # Axios clients configuration
│   │   ├── App.jsx         # App routes mapping
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🔑 Setup Environment Variables

### Backend Setup
Create a `.env` file in the `/backend` directory using the template below:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/metro_ticket_booking
JWT_SECRET=supersecretjwttokenkeyforauth12345
GOOGLE_MAPS_API_KEY=your_google_maps_key
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
FRONTEND_URL=http://localhost:5173
```
*Note: If no Google Maps API Key or Razorpay keys are provided (or are set to `mock`), the application automatically activates **Sandbox Fallback Mode** (see details below).*

---

## 🗺️ Google Maps Setup Instructions

1. **Google Cloud Console**: Sign in to the [Google Cloud Console](https://console.cloud.google.com/).
2. **Project Creation**: Create a new Google Cloud project named `MetroGo`.
3. **Enable APIs**: Navigate to **APIs & Services > Library** and enable the following:
   - **Maps JavaScript API** (For map view scripts)
   - **Places API** (For location search and autocomplete predictions)
   - **Geocoding API** (For reverse coordinates calculations)
4. **Create Credentials**: Go to **APIs & Services > Credentials**, click **Create Credentials > API Key**.
5. **Security Restrictions (Production)**:
   - Under *Application restrictions*, select *Web sites (HTTP referrers)*.
   - Add your website domains (e.g. `http://localhost:5173`).
   - Under *API restrictions*, restrict the key to only call the three APIs enabled in step 3.
6. **Key Storage**: Paste this key into the `GOOGLE_MAPS_API_KEY` parameter in `backend/.env`.

---

## 💳 Razorpay Payment Gateway Setup

1. **Razorpay Dashboard**: Sign up or log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. **Test Mode Activation**: Toggle the environment to **Test Mode** (look for the toggle in the header/sidebar). *Never use Live Mode keys for local development testing.*
3. **Generate Keys**: Navigate to **Account & Settings > API Keys** and click **Generate Key-ID**.
4. **Environment Storage**:
   - Copy the `Key ID` and paste into `RAZORPAY_KEY_ID` in `backend/.env`.
   - Copy the `Key Secret` and paste into `RAZORPAY_KEY_SECRET` in `backend/.env`.
5. **Sandbox Card Details**: During checkout, test payment processes using Razorpay's test credentials:
   - **UPI**: Enter any dummy address (e.g. `success@razorpay`) and click success in the simulation.
   - **Cards**: Use test card numbers like `4111 1111 1111 1111` with any expiry date and CVV.

---

## 🛠️ Sandbox Fallback Mode (Runs Out-of-the-Box)

To allow developers to evaluate the application without setting up API keys, MetroGo includes fallback mechanisms:

1. **Mock Payment checkout**: If `RAZORPAY_KEY_ID=mock`, the frontend checkout page will display a sandbox prompt allowing you to trigger a `Simulate Payment SUCCESS` or `Simulate Payment FAILURE` response. Choosing success sends a mock signature to the server, confirming the ticket and generating a secure QR code.
2. **Mock Places Autocomplete**: If `GOOGLE_MAPS_API_KEY` is blank or mock, the location search utilizes an in-memory matching list mapped to the 13 seeded stations.
3. **Leaflet Map fallback**: An interactive map powered by Leaflet and OpenStreetMap renders automatically, tracing intermediate station markers and the metro path.

---

## 🚀 Installation & Running

### Prerequisites
- Install [Node.js](https://nodejs.org/) (Version 18 or above recommended).
- Install and start [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally. Ensure it is listening on port `27017`.
  *(For Windows, start via CMD/Powershell as Admin: `net start MongoDB`)*

### Step 1: Install Dependencies
Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

### Step 2: Seed the Database
Run the seeding script to populate stations, lines, connections, fare configurations, and the default administrator user:
```bash
cd backend
npm run seed
```
*Seeded Admin Account: `admin@metro.com` / `admin123`*

### Step 3: Run the Application

**Terminal 1 (Backend Dev Server):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Run Automated Integration Tests

To run the Jest API integration tests:
```bash
cd backend
npm test
```
The test suite validates the full lifecycle flow: registers a commuter, logs them in, checks the stations listing, calculates routes/fares, completes booking creation, verifies signatures, and runs ticket scan gate validations.
