# Flockly - MERN Stack Architecture Detailed Explanation

## Table of Contents
1. [Overview](#overview)
2. [MongoDB (M)](#mongodb-m)
3. [Express.js (E)](#expressjs-e)
4. [React (R)](#react-r)
5. [Node.js (N)](#nodejs-n)
6. [Data Flow](#data-flow)
7. [Authentication System](#authentication-system)
8. [API Architecture](#api-architecture)

---

## Overview

Flockly is a full-stack event management platform built using the MERN stack:
- **M**ongoDB - NoSQL database for storing data
- **E**xpress.js - Backend web framework
- **R**eact - Frontend UI library
- **N**ode.js - JavaScript runtime environment

The application follows a client-server architecture where React handles the frontend, Express/Node.js manages the backend API, and MongoDB stores all persistent data.

---

## MongoDB (M)

### What is MongoDB?
MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents called BSON (Binary JSON). Unlike traditional SQL databases with tables and rows, MongoDB uses collections and documents.

### Why MongoDB for Flockly?
1. **Flexible Schema** - Event data can have custom fields without rigid structure
2. **JSON-like Documents** - Natural fit for JavaScript applications
3. **Scalability** - Easy to scale horizontally as user base grows
4. **Fast Queries** - Efficient indexing for quick event lookups

### Database Structure in Flockly

#### 1. Users Collection
Stores information about managers and regular users.

**Schema:**
```javascript
{
  _id: ObjectId("..."),
  googleId: "1234567890",
  name: "John Doe",
  email: "john@example.com",
  profilePicture: "https://...",
  userType: "manager" // or "user"
}
```

**Purpose:**
- Authenticate users via Google OAuth
- Differentiate between managers (can create events) and users (can register)
- Store profile information from Google

**Key Features:**
- `googleId` is unique identifier from Google OAuth
- `userType` determines access permissions
- Linked to events via `managerId` reference



#### 2. Events Collection
Stores all event information created by managers.

**Schema:**
```javascript
{
  _id: ObjectId("..."),
  eventName: "Tech Conference 2024",
  description: "Annual technology conference...",
  image: "data:image/jpeg;base64,...", // Base64 encoded image
  price: 500,
  lastDate: ISODate("2024-12-31"),
  eventDate: ISODate("2025-01-15"),
  eventTime: "10:00 AM",
  capacity: 100,
  venue: "Convention Center",
  contact: "+1234567890",
  customFields: {
    // Additional dynamic fields
  },
  managerId: ObjectId("..."), // Reference to Users collection
  registeredCount: 25,
  createdAt: ISODate("2024-11-01")
}
```

**Purpose:**
- Store complete event details
- Track registration count vs capacity
- Link events to their creators (managers)
- Support custom fields for flexibility

**Key Features:**
- `managerId` creates relationship with Users collection
- `registeredCount` auto-increments on each registration
- `capacity` enforces maximum attendees
- Images stored as base64 strings (embedded in document)

**Indexes:**
- `managerId` - Fast lookup of manager's events
- `eventDate` - Sort events chronologically
- `createdAt` - Default sorting



#### 3. Registrations Collection
Stores user registrations for events.

**Schema:**
```javascript
{
  _id: ObjectId("..."),
  eventId: ObjectId("..."), // Reference to Events collection
  name: "Jane Smith",
  email: "jane@example.com",
  phoneNumber: "+9876543210",
  transactionScreenshot: "data:image/jpeg;base64,...",
  registeredAt: ISODate("2024-11-17")
}
```

**Purpose:**
- Track who registered for which event
- Store payment proof (transaction screenshot)
- Prevent duplicate registrations
- Provide contact information for event managers

**Key Features:**
- `eventId` links to Events collection
- `email` used for duplicate detection (case-insensitive)
- Transaction screenshot stored as base64
- Automatic timestamp on registration

**Indexes:**
- Compound index on `(eventId, email)` - Prevents duplicates
- `eventId` - Fast lookup of event registrations
- `registeredAt` - Sort by registration time

### MongoDB Operations in Flockly

**Create (Insert):**
```javascript
// Creating a new event
const event = await Event.create({
  eventName: "Conference",
  description: "...",
  // ... other fields
});
```

**Read (Query):**
```javascript
// Find all events by a manager
const events = await Event.find({ managerId: req.user._id });

// Find single event by ID
const event = await Event.findById(eventId);
```

**Update:**
```javascript
// Increment registration count
event.registeredCount = (event.registeredCount || 0) + 1;
await event.save();
```

**Delete:**
```javascript
// Delete an event
await Event.findOneAndDelete({ _id: eventId, managerId: req.user._id });
```



### Mongoose ODM (Object Document Mapper)

Flockly uses Mongoose to interact with MongoDB. Mongoose provides:

1. **Schema Definition** - Structure for documents
2. **Validation** - Ensure data integrity
3. **Type Casting** - Automatic type conversion
4. **Middleware** - Pre/post hooks for operations
5. **Query Building** - Chainable query methods

**Example Model Definition:**
```javascript
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true  // Validation
  },
  price: {
    type: Number,
    required: true
  },
  registeredCount: {
    type: Number,
    default: 0  // Default value
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to another collection
    required: true
  }
});

module.exports = mongoose.model('Event', eventSchema);
```

---

## Express.js (E)

### What is Express.js?
Express is a minimal and flexible Node.js web application framework that provides robust features for building web and mobile applications. It's the "E" in MERN and handles all backend routing and middleware.

### Role in Flockly
Express.js serves as the backend API server that:
1. Handles HTTP requests from React frontend
2. Processes business logic
3. Interacts with MongoDB
4. Manages authentication and sessions
5. Sends JSON responses back to frontend

### Server Setup

**File: `server/server.js`**

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

**Key Middleware:**
1. **CORS** - Allows frontend (port 3000) to communicate with backend (port 5000)
2. **express.json()** - Parses incoming JSON requests
3. **express.urlencoded()** - Parses URL-encoded data
4. **Session** - Manages user sessions for authentication



### Express Routing Architecture

#### 1. Authentication Routes

**Google OAuth Flow:**
```javascript
// Initiate Google OAuth
app.get('/auth/google', 
  (req, res, next) => {
    req.session.userType = req.query.userType; // Store user type
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    // Update user type and redirect
    req.user.userType = req.session.userType;
    await req.user.save();
    res.redirect(`${process.env.CLIENT_URL}?auth=success`);
  }
);
```

**How it works:**
1. User clicks "Login as Manager" or "Login as User"
2. Frontend redirects to `/auth/google?userType=manager`
3. Express stores userType in session
4. Redirects to Google login page
5. Google authenticates and redirects back to callback URL
6. Express creates/updates user in database
7. Redirects back to frontend with success status

#### 2. Event Routes

**Create Event (Manager Only):**
```javascript
app.post('/api/events', isAuthenticated, isManager, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      managerId: req.user._id  // Link to logged-in manager
    };
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

**Middleware Chain:**
1. `isAuthenticated` - Checks if user is logged in
2. `isManager` - Verifies user has manager privileges
3. Route handler - Creates event in database

**Get All Events (Public):**
```javascript
app.get('/api/events', async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json({ success: true, events });
});
```

**Get Single Event:**
```javascript
app.get('/api/events/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  res.json({ success: true, event });
});
```

**Update Event:**
```javascript
app.put('/api/events/:id', isAuthenticated, isManager, async (req, res) => {
  const event = await Event.findOne({ 
    _id: req.params.id, 
    managerId: req.user._id  // Ensure manager owns this event
  });
  
  if (!event) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  
  Object.assign(event, req.body);
  await event.save();
  res.json({ success: true, event });
});
```

**Delete Event:**
```javascript
app.delete('/api/events/:id', isAuthenticated, isManager, async (req, res) => {
  const event = await Event.findOneAndDelete({ 
    _id: req.params.id, 
    managerId: req.user._id 
  });
  
  if (!event) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  
  res.json({ success: true, message: 'Event deleted' });
});
```



#### 3. Registration Routes

**Create Registration:**
```javascript
app.post('/api/registrations', async (req, res) => {
  try {
    const { eventId, name, email, phoneNumber, transactionScreenshot } = req.body;

    // 1. Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // 2. Check if event is full
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event is full' 
      });
    }

    // 3. Check for duplicate registration
    const existingRegistration = await Registration.findOne({ 
      eventId, 
      email: email.toLowerCase() 
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered' 
      });
    }

    // 4. Create registration
    const registration = await Registration.create({
      eventId, name, email, phoneNumber, transactionScreenshot
    });

    // 5. Update event registration count
    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    res.status(201).json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

**Business Logic Flow:**
1. Validate event exists
2. Check capacity limit
3. Prevent duplicate registrations
4. Create registration record
5. Increment event's registered count
6. Return success response

**Get Event Registrations (Manager Only):**
```javascript
app.get('/api/registrations/event/:eventId', 
  isAuthenticated, 
  isManager, 
  async (req, res) => {
    const registrations = await Registration
      .find({ eventId: req.params.eventId })
      .sort({ registeredAt: -1 });
    
    res.json({ success: true, registrations });
  }
);
```

### Middleware Functions

**Authentication Check:**
```javascript
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();  // User is logged in, proceed
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};
```

**Manager Authorization:**
```javascript
const isManager = (req, res, next) => {
  if (req.user && req.user.userType === 'manager') {
    return next();  // User is a manager, proceed
  }
  res.status(403).json({ success: false, message: 'Manager only' });
};
```

**How Middleware Works:**
```
Request → isAuthenticated → isManager → Route Handler → Response
```

If any middleware fails, the chain stops and error response is sent.



### Error Handling

Express uses try-catch blocks for error handling:

```javascript
try {
  // Database operations
  const event = await Event.create(eventData);
  res.json({ success: true, event });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Failed to create event',
    error: error.message 
  });
}
```

**HTTP Status Codes Used:**
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## React (R)

### What is React?
React is a JavaScript library for building user interfaces. It uses a component-based architecture where UI is broken down into reusable pieces called components.

### Role in Flockly
React powers the entire frontend:
1. Renders UI components
2. Manages application state
3. Handles user interactions
4. Makes API calls to Express backend
5. Updates UI based on data changes

### Component Architecture

#### 1. App.js - Root Component

**Purpose:** Main application controller that manages routing and authentication state.

```javascript
function App() {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const response = await authService.getCurrentUser();
    if (response.success && response.user) {
      setUser(response.user);
      setUserType(response.user.userType);
    }
  };

  // Conditional rendering based on state
  if (currentView === 'viewEvent') {
    return <ViewEvent eventId={selectedEventId} onBack={handleBackToHome} />;
  }

  if (currentView === 'registerEvent') {
    return <RegisterEvent eventId={selectedEventId} onSuccess={handleSuccess} />;
  }

  return (
    <div>
      {userType === 'manager' ? (
        <FlocklyManagerHome />
      ) : userType === 'user' ? (
        <FlocklyUserHome onViewEvent={handleViewEvent} />
      ) : (
        <FlocklyLogin onLogin={handleLogin} />
      )}
    </div>
  );
}
```

**State Management:**
- `userType` - Determines which home page to show
- `user` - Stores logged-in user data
- `currentView` - Controls which page is displayed
- `selectedEventId` - Tracks which event user is viewing/registering for

**React Hooks Used:**
- `useState` - Manages component state
- `useEffect` - Runs side effects (API calls on mount)



#### 2. FlocklyLogin.js - Authentication Component

**Purpose:** Handles user login via Google OAuth.

```javascript
function FlocklyLogin({ onLogin }) {
  const handleGoogleLogin = (userType) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `http://localhost:5000/auth/google?userType=${userType}`;
  };

  return (
    <div>
      <button onClick={() => handleGoogleLogin('manager')}>
        Login as Manager
      </button>
      <button onClick={() => handleGoogleLogin('user')}>
        Login as User
      </button>
    </div>
  );
}
```

**Flow:**
1. User clicks login button
2. Browser redirects to Express OAuth route
3. Google handles authentication
4. Express redirects back with auth status
5. React detects auth success and updates state

#### 3. CreateEvent.jsx - Event Creation Form

**Purpose:** Allows managers to create new events.

```javascript
function CreateEvent({ onEventCreated }) {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    image: '',
    price: '',
    // ... other fields
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);  // Convert to base64
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Send cookies for authentication
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (data.success) {
      alert('Event created!');
      onEventCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={formData.eventName}
        onChange={(e) => setFormData({...formData, eventName: e.target.value})}
      />
      <input type="file" onChange={handleImageUpload} />
      {/* More form fields */}
      <button type="submit">Create Event</button>
    </form>
  );
}
```

**Key Concepts:**
- **Controlled Components** - Form inputs controlled by React state
- **FileReader API** - Converts images to base64 strings
- **Fetch API** - Makes HTTP POST request to backend
- **Credentials** - Includes session cookies for authentication



#### 4. ViewEvent.jsx - Event Details Component

**Purpose:** Displays event information and registration button.

```javascript
function ViewEvent({ eventId, onBack, onRegister }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    // Check localStorage for registration status
    const registered = localStorage.getItem(`registered_${eventId}`);
    if (registered === "true") {
      setHasRegistered(true);
    }

    // Fetch event data
    fetch(`http://localhost:5000/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data.event);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      
      <img src={event.image} alt={event.eventName} />
      
      <h2>{event.eventName}</h2>
      <p>{event.description}</p>
      <p>Price: ₹{event.price}</p>
      <p>Capacity: {event.capacity}</p>
      <p>Registered: {event.registeredCount}</p>
      
      {hasRegistered ? (
        <div>Already Registered ✓</div>
      ) : event.registeredCount >= event.capacity ? (
        <div>Event Full - Registration Closed</div>
      ) : (
        <button onClick={() => onRegister(eventId)}>
          Register Now
        </button>
      )}
    </div>
  );
}
```

**State Logic:**
1. Check localStorage for previous registration
2. Fetch event data from API
3. Show loading state while fetching
4. Conditionally render button based on:
   - User already registered
   - Event at capacity
   - Available for registration

**localStorage Usage:**
- Persists registration status across page refreshes
- Key format: `registered_${eventId}`
- Value: `"true"` or not present



#### 5. RegisterEvent.jsx - Registration Form Component

**Purpose:** Handles user registration for events.

```javascript
function RegisterEvent({ eventId, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    transactionScreenshot: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          transactionScreenshot: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...formData })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server not responding. Check if backend is running.");
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Save to localStorage
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem(`registered_${eventId}`, "true");
        
        alert("Registration successful!");
        onSuccess();  // Navigate back to home
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      alert(`Failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input 
        type="email" 
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input 
        type="tel" 
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
        required
      />
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        required
      />
      
      {formData.transactionScreenshot && (
        <img src={formData.transactionScreenshot} alt="Preview" />
      )}
      
      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Complete Registration"}
      </button>
    </form>
  );
}
```

**Features:**
- **Form Validation** - HTML5 required attributes
- **Image Preview** - Shows uploaded screenshot before submission
- **Loading State** - Disables button during submission
- **Error Handling** - Checks response type before parsing JSON
- **Success Callback** - Navigates back to home after registration
- **localStorage** - Saves registration status



#### 6. FlocklyUserHome.js - User Dashboard

**Purpose:** Displays all available events for users to browse.

```javascript
function FlocklyUserHome({ onViewEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      <h1>Available Events</h1>
      <div className="events-grid">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <img src={event.image} alt={event.eventName} />
            <h3>{event.eventName}</h3>
            <p>₹{event.price}</p>
            <p>{new Date(event.eventDate).toLocaleDateString()}</p>
            <button onClick={() => onViewEvent(event._id)}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**React Patterns:**
- **useEffect with empty dependency array** - Runs once on mount
- **Array.map()** - Renders list of events
- **Key prop** - Unique identifier for list items (event._id)
- **Callback props** - onViewEvent passed from parent

#### 7. FlocklyManagerHome.js - Manager Dashboard

**Purpose:** Shows manager's events with create/edit/delete options.

```javascript
function FlocklyManagerHome() {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchManagerEvents();
  }, []);

  const fetchManagerEvents = async () => {
    const response = await fetch('http://localhost:5000/api/events/manager', {
      credentials: 'include'  // Send session cookie
    });
    const data = await response.json();
    if (data.success) {
      setEvents(data.events);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    
    const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      setEvents(events.filter(e => e._id !== eventId));
      alert('Event deleted');
    }
  };

  return (
    <div>
      <button onClick={() => setShowCreateForm(true)}>
        Create New Event
      </button>
      
      {showCreateForm && (
        <CreateEvent 
          onEventCreated={() => {
            setShowCreateForm(false);
            fetchManagerEvents();
          }}
        />
      )}
      
      <div className="events-list">
        {events.map(event => (
          <div key={event._id}>
            <h3>{event.eventName}</h3>
            <p>Registered: {event.registeredCount}/{event.capacity}</p>
            <button onClick={() => handleDelete(event._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Manager-Specific Features:**
- Fetches only manager's events (`/api/events/manager`)
- Create, delete operations
- Shows registration statistics
- Conditional rendering of create form



### React State Management

**Local State (useState):**
```javascript
const [value, setValue] = useState(initialValue);
```
- Used for component-specific data
- Re-renders component when state changes
- Examples: form inputs, loading states, modal visibility

**Props:**
```javascript
<ChildComponent data={parentData} onAction={handleAction} />
```
- Pass data from parent to child
- One-way data flow (parent → child)
- Callbacks allow child to communicate with parent

**Lifting State Up:**
When multiple components need the same state, it's moved to their common parent:

```
App (manages selectedEventId)
├── FlocklyUserHome (passes onViewEvent callback)
└── ViewEvent (receives eventId prop)
```

### React Lifecycle with Hooks

**useEffect Hook:**
```javascript
useEffect(() => {
  // Code runs after component renders
  fetchData();
  
  return () => {
    // Cleanup function (optional)
    cancelRequest();
  };
}, [dependency]);  // Re-run when dependency changes
```

**Common Patterns:**

1. **Run once on mount:**
```javascript
useEffect(() => {
  fetchEvents();
}, []);  // Empty array = run once
```

2. **Run when prop changes:**
```javascript
useEffect(() => {
  fetchEvent(eventId);
}, [eventId]);  // Re-fetch when eventId changes
```

3. **Cleanup on unmount:**
```javascript
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```

### Styling with Tailwind CSS

Flockly uses Tailwind CSS for styling:

```javascript
<button className="w-full mt-6 bg-black text-white py-3 rounded-xl font-bold text-lg hover:bg-gray-800 transition">
  Register Now
</button>
```

**Utility Classes:**
- `w-full` - width: 100%
- `mt-6` - margin-top: 1.5rem
- `bg-black` - background: black
- `text-white` - color: white
- `py-3` - padding-y: 0.75rem
- `rounded-xl` - border-radius: 0.75rem
- `hover:bg-gray-800` - hover state
- `transition` - smooth transitions

**Responsive Design:**
```javascript
<div className="flex flex-col md:flex-row gap-10">
```
- `flex-col` - column on mobile
- `md:flex-row` - row on medium screens and up



---

## Node.js (N)

### What is Node.js?
Node.js is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server side. It's the foundation that Express.js runs on.

### Role in Flockly
Node.js provides:
1. **JavaScript Runtime** - Executes server-side JavaScript
2. **NPM** - Package manager for dependencies
3. **Event Loop** - Handles asynchronous operations
4. **File System Access** - Read/write files
5. **Network Operations** - HTTP server capabilities

### Key Node.js Concepts

#### 1. Asynchronous Programming

**Callbacks:**
```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

**Promises:**
```javascript
Event.find()
  .then(events => console.log(events))
  .catch(err => console.error(err));
```

**Async/Await (Used in Flockly):**
```javascript
async function getEvents() {
  try {
    const events = await Event.find();
    return events;
  } catch (error) {
    console.error(error);
  }
}
```

**Why Async/Await?**
- Cleaner syntax than callbacks
- Easier error handling with try-catch
- Looks like synchronous code but doesn't block

#### 2. Module System

**CommonJS (Used in Backend):**
```javascript
// Exporting
module.exports = Event;

// Importing
const Event = require('./models/Event');
const express = require('express');
```

**ES Modules (Used in Frontend):**
```javascript
// Exporting
export default Event;
export { helper1, helper2 };

// Importing
import Event from './Event';
import { helper1 } from './helpers';
```

#### 3. Environment Variables

**File: `.env`**
```
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=mysecret123
PORT=5000
```

**Loading with dotenv:**
```javascript
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;
```

**Why Environment Variables?**
- Keep secrets out of code
- Different configs for dev/production
- Easy to change without code changes



#### 4. NPM (Node Package Manager)

**package.json:**
```json
{
  "name": "flockly-server",
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.19.3",
    "passport": "^0.7.0",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Key Dependencies:**
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **passport** - Authentication middleware
- **passport-google-oauth20** - Google OAuth strategy
- **express-session** - Session management
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

**Installing Packages:**
```bash
npm install express mongoose
npm install --save-dev nodemon  # Dev dependency
```

#### 5. Event Loop

Node.js uses a single-threaded event loop for handling concurrent operations:

```
┌───────────────────────────┐
│        Event Queue         │
│  [Request 1, Request 2]   │
└───────────────────────────┘
            ↓
┌───────────────────────────┐
│       Event Loop          │
│  (Single Thread)          │
└───────────────────────────┘
            ↓
┌───────────────────────────┐
│    Thread Pool            │
│  [DB Query, File I/O]     │
└───────────────────────────┘
```

**How it works:**
1. Request comes in
2. Event loop picks it up
3. If async operation (DB query), delegates to thread pool
4. Event loop continues processing other requests
5. When async operation completes, callback is queued
6. Event loop executes callback

**Example in Flockly:**
```javascript
app.get('/api/events', async (req, res) => {
  // Event loop delegates this to thread pool
  const events = await Event.find();
  
  // When DB query completes, event loop sends response
  res.json({ events });
});
```

This allows Node.js to handle thousands of concurrent connections with a single thread.



---

## Data Flow

### Complete Request-Response Cycle

Let's trace a user registration from start to finish:

#### Step 1: User Fills Form (React)
```javascript
// RegisterEvent.jsx
const [formData, setFormData] = useState({
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '1234567890',
  transactionScreenshot: 'data:image/jpeg;base64,...'
});
```

#### Step 2: Form Submission (React → Express)
```javascript
// RegisterEvent.jsx
const response = await fetch('http://localhost:5000/api/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId: '123', ...formData })
});
```

**HTTP Request:**
```
POST /api/registrations HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "eventId": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "transactionScreenshot": "data:image/jpeg;base64,..."
}
```

#### Step 3: Express Receives Request
```javascript
// server.js
app.post('/api/registrations', async (req, res) => {
  const { eventId, name, email, phoneNumber, transactionScreenshot } = req.body;
  // req.body contains the parsed JSON data
```

#### Step 4: Business Logic (Express)
```javascript
  // 1. Find event in MongoDB
  const event = await Event.findById(eventId);
  
  // 2. Check capacity
  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ success: false, message: 'Event full' });
  }
  
  // 3. Check duplicate
  const existing = await Registration.findOne({ eventId, email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already registered' });
  }
```

#### Step 5: Database Operations (MongoDB)
```javascript
  // 4. Create registration document
  const registration = await Registration.create({
    eventId,
    name,
    email,
    phoneNumber,
    transactionScreenshot
  });
  
  // MongoDB executes:
  // db.registrations.insertOne({
  //   eventId: ObjectId("123"),
  //   name: "John Doe",
  //   email: "john@example.com",
  //   ...
  // })
  
  // 5. Update event
  event.registeredCount += 1;
  await event.save();
  
  // MongoDB executes:
  // db.events.updateOne(
  //   { _id: ObjectId("123") },
  //   { $set: { registeredCount: 26 } }
  // )
```

#### Step 6: Send Response (Express → React)
```javascript
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    registration
  });
});
```

**HTTP Response:**
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Registration successful",
  "registration": {
    "_id": "abc123",
    "eventId": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "registeredAt": "2024-11-17T10:30:00Z"
  }
}
```

#### Step 7: Handle Response (React)
```javascript
// RegisterEvent.jsx
const data = await response.json();

if (response.ok && data.success) {
  localStorage.setItem(`registered_${eventId}`, "true");
  alert("Registration successful!");
  onSuccess();  // Navigate to home
} else {
  alert(data.message);
}
```



### Visual Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Application                      │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Components   │  │    State     │               │    │
│  │  │ - ViewEvent  │  │ - events[]   │               │    │
│  │  │ - Register   │  │ - user       │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  │           ↓                ↑                        │    │
│  │      Fetch API        JSON Response                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         ↓                ↑
                    HTTP Request    HTTP Response
                         ↓                ↑
┌─────────────────────────────────────────────────────────────┐
│                      NODE.JS SERVER                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Express.js                             │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │  Middleware  │  │    Routes    │               │    │
│  │  │ - CORS       │  │ - /api/events│               │    │
│  │  │ - Session    │  │ - /api/reg   │               │    │
│  │  │ - Auth       │  │ - /auth/*    │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  │           ↓                ↑                        │    │
│  │    Mongoose ODM      Query Results                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         ↓                ↑
                   MongoDB Protocol
                         ↓                ↑
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Collections                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │  users   │  │  events  │  │  regs    │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User clicks "Login as Manager"
   ↓
2. React redirects to: http://localhost:5000/auth/google?userType=manager
   ↓
3. Express stores userType in session
   ↓
4. Express redirects to Google OAuth
   ↓
5. User logs in with Google
   ↓
6. Google redirects to: http://localhost:5000/auth/google/callback
   ↓
7. Passport verifies OAuth token
   ↓
8. Express finds/creates user in MongoDB
   ↓
9. Express updates user.userType = 'manager'
   ↓
10. Express creates session cookie
   ↓
11. Express redirects to: http://localhost:3000?auth=success&userType=manager
   ↓
12. React detects auth success
   ↓
13. React fetches user data: GET /auth/user
   ↓
14. Express returns user data (using session cookie)
   ↓
15. React updates state and shows manager dashboard
```



---

## Authentication System

### Passport.js Configuration

**File: `server/config/passport.js`**

```javascript
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return it
            return done(null, user);
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              profilePicture: profile.photos[0].value,
              userType: 'user'  // Default, will be updated
            });
            return done(null, user);
          }
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);  // Store only user ID in session
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);  // Attach full user object to req.user
    } catch (error) {
      done(error, null);
    }
  });
};
```

### Session Management

**Express Session Configuration:**
```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET,  // Encryption key
    resave: false,  // Don't save session if unmodified
    saveUninitialized: false,  // Don't create session until something stored
    cookie: {
      maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
  })
);
```

**How Sessions Work:**

1. **User logs in:**
   - Passport creates session
   - Session ID stored in cookie
   - Session data stored on server

2. **Subsequent requests:**
   - Browser sends session cookie
   - Express looks up session
   - Passport deserializes user
   - User object available as `req.user`

3. **Session data structure:**
```javascript
{
  sessionId: "abc123...",
  userId: "507f1f77bcf86cd799439011",
  userType: "manager",
  expires: "2024-11-18T10:00:00Z"
}
```

### Protected Routes

**Authentication Middleware:**
```javascript
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // req.isAuthenticated() checks if session exists
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};
```

**Authorization Middleware:**
```javascript
const isManager = (req, res, next) => {
  if (req.user && req.user.userType === 'manager') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Manager only' });
};
```

**Usage:**
```javascript
// Public route - anyone can access
app.get('/api/events', async (req, res) => { ... });

// Protected route - must be logged in
app.get('/auth/user', isAuthenticated, (req, res) => { ... });

// Manager-only route - must be logged in as manager
app.post('/api/events', isAuthenticated, isManager, async (req, res) => { ... });
```



---

## API Architecture

### RESTful API Design

Flockly follows REST (Representational State Transfer) principles:

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/events` | Get all events | No |
| GET | `/api/events/:id` | Get single event | No |
| POST | `/api/events` | Create event | Manager |
| PUT | `/api/events/:id` | Update event | Manager |
| DELETE | `/api/events/:id` | Delete event | Manager |
| GET | `/api/events/manager` | Get manager's events | Manager |
| POST | `/api/registrations` | Register for event | No |
| GET | `/api/registrations/event/:eventId` | Get event registrations | Manager |
| GET | `/auth/google` | Initiate OAuth | No |
| GET | `/auth/google/callback` | OAuth callback | No |
| GET | `/auth/user` | Get current user | Yes |
| GET | `/auth/logout` | Logout | Yes |

### HTTP Methods

**GET** - Retrieve data
```javascript
app.get('/api/events', async (req, res) => {
  const events = await Event.find();
  res.json({ success: true, events });
});
```

**POST** - Create new resource
```javascript
app.post('/api/events', async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, event });
});
```

**PUT** - Update existing resource
```javascript
app.put('/api/events/:id', async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true, event });
});
```

**DELETE** - Remove resource
```javascript
app.delete('/api/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
```

### Request/Response Format

**Standard Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### CORS (Cross-Origin Resource Sharing)

**Why CORS?**
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:5000`
- Different origins = CORS policy blocks requests

**Solution:**
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,  // http://localhost:3000
  credentials: true  // Allow cookies
}));
```

**Frontend must include credentials:**
```javascript
fetch('http://localhost:5000/api/events', {
  credentials: 'include'  // Send cookies
});
```



---

## Advanced Concepts

### 1. Image Handling

**Base64 Encoding:**
Flockly stores images as base64 strings in MongoDB.

**Frontend (React):**
```javascript
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onloadend = () => {
    // reader.result contains base64 string
    // Example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    setFormData(prev => ({ ...prev, image: reader.result }));
  };
  
  reader.readAsDataURL(file);  // Convert to base64
};
```

**Backend (Express):**
```javascript
// Increase JSON payload limit for large images
app.use(express.json({ limit: '50mb' }));

// Store base64 string directly in MongoDB
const event = await Event.create({
  image: req.body.image  // "data:image/jpeg;base64,..."
});
```

**Display in React:**
```javascript
<img src={event.image} alt={event.eventName} />
// Browser automatically decodes base64 and displays image
```

**Pros:**
- Simple implementation
- No separate file storage needed
- Images embedded in documents

**Cons:**
- Increases document size
- Not ideal for very large images
- Better alternatives: AWS S3, Cloudinary

### 2. Duplicate Prevention

**Backend Check:**
```javascript
const existingRegistration = await Registration.findOne({ 
  eventId, 
  email: email.toLowerCase()  // Case-insensitive
});

if (existingRegistration) {
  return res.status(400).json({ 
    success: false, 
    message: 'Already registered' 
  });
}
```

**Frontend Check:**
```javascript
// Save to localStorage on successful registration
localStorage.setItem(`registered_${eventId}`, "true");

// Check before showing register button
const hasRegistered = localStorage.getItem(`registered_${eventId}`) === "true";
```

**Why Both?**
- Frontend check: Better UX, instant feedback
- Backend check: Security, can't be bypassed

### 3. Capacity Management

**Atomic Update:**
```javascript
// Increment registration count
event.registeredCount = (event.registeredCount || 0) + 1;
await event.save();
```

**Check Before Registration:**
```javascript
if (event.registeredCount >= event.capacity) {
  return res.status(400).json({ 
    success: false, 
    message: 'Event is full' 
  });
}
```

**Race Condition Consideration:**
In high-traffic scenarios, use MongoDB's atomic operations:
```javascript
const event = await Event.findOneAndUpdate(
  { 
    _id: eventId, 
    registeredCount: { $lt: capacity }  // Only if not full
  },
  { 
    $inc: { registeredCount: 1 }  // Atomic increment
  },
  { new: true }
);

if (!event) {
  return res.status(400).json({ message: 'Event is full' });
}
```



### 4. Error Handling Best Practices

**Backend:**
```javascript
app.post('/api/events', async (req, res) => {
  try {
    // Validate input
    if (!req.body.eventName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event name is required' 
      });
    }

    // Database operation
    const event = await Event.create(req.body);
    
    // Success response
    res.status(201).json({ success: true, event });
    
  } catch (error) {
    // Log error for debugging
    console.error('Error creating event:', error);
    
    // Send user-friendly error
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create event',
      error: error.message 
    });
  }
});
```

**Frontend:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("Server error. Please check if backend is running.");
    }

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Success!");
      onSuccess();
    } else {
      alert(data.message || "Operation failed");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`Failed: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};
```

### 5. Performance Optimization

**Database Indexing:**
```javascript
// In Event model
eventSchema.index({ managerId: 1 });  // Fast lookup by manager
eventSchema.index({ eventDate: 1 });  // Sort by date
eventSchema.index({ createdAt: -1 }); // Sort by creation

// In Registration model
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
// Compound index for duplicate prevention
```

**React Optimization:**
```javascript
// Memoize expensive calculations
const sortedEvents = useMemo(() => {
  return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}, [events]);

// Prevent unnecessary re-renders
const EventCard = React.memo(({ event, onClick }) => {
  return <div onClick={() => onClick(event._id)}>...</div>;
});
```

**Lazy Loading:**
```javascript
// Load components only when needed
const CreateEvent = React.lazy(() => import('./components/CreateEvent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEvent />
    </Suspense>
  );
}
```



---

## Security Considerations

### 1. Authentication Security

**Session Secret:**
```javascript
session({
  secret: process.env.SESSION_SECRET,  // Strong, random string
  // Never hardcode or commit to Git
})
```

**Password-less Authentication:**
- Uses Google OAuth instead of passwords
- No password storage or management
- Leverages Google's security infrastructure

### 2. Input Validation

**Backend Validation:**
```javascript
// Mongoose schema validation
const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name too long']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
});
```

**Frontend Validation:**
```javascript
<input 
  type="email" 
  required 
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
/>
```

### 3. Authorization

**Ownership Verification:**
```javascript
// Ensure manager can only modify their own events
const event = await Event.findOne({ 
  _id: req.params.id, 
  managerId: req.user._id  // Must match logged-in user
});

if (!event) {
  return res.status(403).json({ message: 'Unauthorized' });
}
```

### 4. Environment Variables

**Never commit sensitive data:**
```javascript
// ❌ Bad
const mongoUri = "mongodb+srv://user:password@cluster.mongodb.net";

// ✅ Good
const mongoUri = process.env.MONGODB_URI;
```

**.gitignore:**
```
.env
node_modules/
```

### 5. CORS Configuration

**Restrict origins:**
```javascript
// ❌ Bad - allows all origins
app.use(cors({ origin: '*' }));

// ✅ Good - specific origin
app.use(cors({ 
  origin: process.env.CLIENT_URL,
  credentials: true 
}));
```

### 6. Rate Limiting (Future Enhancement)

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Limit each IP to 100 requests per window
});

app.use('/api/', limiter);
```

---

## Deployment Considerations

### Frontend (React)

**Build for Production:**
```bash
npm run build
```

**Deployment Options:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Environment Variables:**
```javascript
// Use environment-specific API URLs
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Backend (Node.js/Express)

**Production Server:**
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Deployment Options:**
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

**Process Manager:**
```bash
# Use PM2 for production
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

### Database (MongoDB)

**MongoDB Atlas:**
- Already cloud-hosted
- Automatic backups
- Scalable
- Update connection string for production

**Security:**
- Whitelist production server IP
- Use strong database password
- Enable MongoDB authentication

---

## Summary

### MERN Stack Benefits

1. **Single Language:** JavaScript everywhere (frontend, backend, database queries)
2. **JSON Throughout:** Native JSON support from React to MongoDB
3. **Rich Ecosystem:** Massive NPM package library
4. **Scalability:** Each layer can scale independently
5. **Community:** Large community, extensive documentation
6. **Modern:** Uses latest JavaScript features (async/await, ES6+)

### Flockly Architecture Summary

```
React (Frontend)
├── Components (UI)
├── State Management (useState, useEffect)
├── API Calls (Fetch)
└── Routing (Conditional rendering)

Express (Backend)
├── Routes (API endpoints)
├── Middleware (Auth, CORS, Sessions)
├── Business Logic (Validation, processing)
└── Mongoose (Database operations)

MongoDB (Database)
├── Users Collection
├── Events Collection
└── Registrations Collection

Node.js (Runtime)
├── JavaScript Execution
├── NPM Packages
├── Event Loop
└── Async Operations
```

### Key Takeaways

1. **Separation of Concerns:** Frontend, backend, and database are independent
2. **RESTful API:** Clean interface between frontend and backend
3. **Authentication:** Passport.js + Google OAuth for secure login
4. **Data Validation:** Both frontend and backend validation
5. **Error Handling:** Comprehensive try-catch and user feedback
6. **Security:** Environment variables, CORS, authorization checks
7. **Scalability:** Can handle growing user base and data

---

**End of MERN Stack Explanation**

This document covers the complete architecture of the Flockly event management platform, explaining how MongoDB, Express.js, React, and Node.js work together to create a full-stack application.
