# 🎉 Flockly - Event Management Platform

A modern, full-stack event management platform that connects event managers with attendees. Built with React, Node.js, Express, and MongoDB.

## ✨ Features

### For Event Managers
- **Google OAuth Authentication** - Secure login for managers
- **Create & Manage Events** - Full CRUD operations for events
- **Event Dashboard** - View all your created events in one place
- **Registration Management** - Track attendees and view registration details
- **Query Management** - Respond to user queries about your events
- **Capacity Control** - Set event capacity and automatic registration cutoff

### For Users
- **Browse Events** - Explore all available events
- **Event Details** - View comprehensive event information including:
  - Event name, description, and image
  - Date, time, and venue
  - Pricing and capacity
  - Registration deadline
  - Contact information
- **Easy Registration** - Simple registration form with:
  - Name and contact details
  - Email verification
  - Transaction screenshot upload
  - Duplicate registration prevention
- **Ask Queries** - Communicate directly with event managers
- **Registration Status** - Visual feedback for registration status

### Smart Features
- **Capacity Management** - Automatic registration closure when event is full
- **Duplicate Prevention** - Users cannot register twice for the same event
- **Real-time Updates** - Registration counts update automatically
- **Responsive Design** - Works seamlessly on all devices
- **Modern UI** - Clean black and white theme with smooth animations

## 🛠️ Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Axios (API calls)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js (Google OAuth)
- Express Session

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Google OAuth credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flockly
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_key
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
PORT=5000
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 5. MongoDB Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file as `MONGODB_URI`

## 🚀 Running the Application

### Start Backend Server
```bash
cd server
npm start
```
Backend runs on `http://localhost:5000`

### Start Frontend
```bash
npm start
```
Frontend runs on `http://localhost:3000`

## 📱 Usage

### As an Event Manager

1. **Login** - Click "Login as Manager" and authenticate with Google
2. **Create Event** - Click "Create New Event" and fill in:
   - Event name and description
   - Upload event image
   - Set price, capacity, and dates
   - Add venue and contact details
3. **Manage Events** - View, edit, or delete your events
4. **View Registrations** - See who registered for your events
5. **Respond to Queries** - Answer questions from potential attendees

### As a User

1. **Browse Events** - View all available events on the home page
2. **View Details** - Click on any event to see full information
3. **Register** - Click "Register Now" and provide:
   - Your name and email
   - Phone number
   - Transaction screenshot
4. **Ask Questions** - Submit queries to event managers
5. **Track Status** - See if you're already registered or if event is full

## 🎨 Design Philosophy

Flockly features a distinctive **black and white theme** with:
- Bold borders and rounded corners
- Clean, minimalist interface
- High contrast for better readability
- Smooth transitions and animations
- Mobile-first responsive design

## 📊 Database Schema

### Events Collection
```javascript
{
  eventName: String,
  description: String,
  image: String,
  price: Number,
  lastDate: Date,
  eventDate: Date,
  eventTime: String,
  capacity: Number,
  venue: String,
  contact: String,
  managerId: ObjectId,
  registeredCount: Number,
  createdAt: Date
}
```

### Registrations Collection
```javascript
{
  eventId: ObjectId,
  name: String,
  email: String,
  phoneNumber: String,
  transactionScreenshot: String,
  registeredAt: Date
}
```

### Users Collection
```javascript
{
  googleId: String,
  name: String,
  email: String,
  profilePicture: String,
  userType: String // 'manager' or 'user'
}
```

## 🔒 Security Features

- Google OAuth 2.0 authentication
- Session-based authentication
- CORS protection
- Environment variable protection
- Duplicate registration prevention
- Manager-only routes protection

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- Check your `MONGODB_URI` in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

### Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check authorized redirect URIs in Google Console
- Ensure `CLIENT_URL` matches your frontend URL

### Registration failing
- Ensure backend server is running on port 5000
- Check browser console for error messages
- Verify MongoDB connection is active

## 👥 Team
-ARYAN NANGARATH-aryannangarath407@gmail.com
-ESHWAR-eshwar10245@gmail.com
-ARJUN BHAT-arjunbhats06@gmail.com
**Happy Event Managing! 🎊**
