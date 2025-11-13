// server/routes/queries.js
const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

// Auth helpers - uses passport's req.isAuthenticated() and req.user (as in your server.js)
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ success: false, message: 'Not authenticated' });
};

const ensureManager = (req, res, next) => {
  if (req.user && req.user.userType === 'manager') return next();
  return res.status(403).json({ success: false, message: 'Manager only' });
};

/**
 * GET /api/queries
 * Optional query params:
 *  - eventId  -> returns queries for that event
 *  - userId   -> returns queries for that user
 *
 * If neither provided:
 *  - if authenticated non-manager, returns queries for that user
 *  - if manager, returns all queries
 */
router.get('/', async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    const filter = {};

    if (eventId) filter.eventId = eventId;
    if (userId) filter.userId = userId;

    if (!eventId && !userId) {
      if (req.isAuthenticated && req.isAuthenticated()) {
        if (req.user && req.user.userType !== 'manager') {
          filter.userId = req.user._id;
        }
        // manager with no filters gets all queries
      } else {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
    }

    // mongoose will match string eventId to ObjectId field
    const queries = await Query.find(filter).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, queries });
  } catch (err) {
    console.error('GET /api/queries error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/queries
 * Creates a new query for eventId. Requires authentication so we can attach userId.
 * Body: { eventId, eventName?, initialMessage? }
 */
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { eventId, eventName, initialMessage } = req.body;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'eventId is required' });
    }

    const qObj = {
      eventId,
      eventName: eventName || '',
      userId: req.user ? req.user._id : undefined,
      userName: req.user ? req.user.name : (req.body.userName || 'Anonymous'),
      messages: [],
      status: 'open',
    };

    if (initialMessage && initialMessage.trim().length > 0) {
      qObj.messages.push({
        sender: 'user',
        text: initialMessage.trim(),
      });
    }

    const created = await Query.create(qObj);
    return res.status(201).json({ success: true, query: created });
  } catch (err) {
    console.error('POST /api/queries error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/queries/:id
 * Returns specific query with messages
 */
router.get('/:id', async (req, res) => {
  try {
    const q = await Query.findById(req.params.id).lean();
    if (!q) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, query: q });
  } catch (err) {
    console.error('GET /api/queries/:id error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/queries/:id/messages
 * Append a message to a query. Requires auth.
 * Body: { text, sender? } sender optional -> server deduces from req.user.userType
 */
router.post('/:id/messages', ensureAuth, async (req, res) => {
  try {
    const { text, sender } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message text required' });
    }

    const q = await Query.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Query not found' });

    // Determine sender
    let finalSender = 'user';
    if (sender === 'manager' || sender === 'user') finalSender = sender;
    else if (req.user && req.user.userType === 'manager') finalSender = 'manager';
    else finalSender = 'user';

    q.messages.push({ sender: finalSender, text: text.trim(), createdAt: new Date() });
    q.updatedAt = Date.now();
    await q.save();

    const newMsg = q.messages[q.messages.length - 1];
    return res.json({ success: true, message: newMsg });
  } catch (err) {
    console.error('POST /api/queries/:id/messages error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Optional manager-only route: GET /api/queries/manager/all
 * Lists all queries (for manager dashboards). Requires manager.
 */
router.get('/manager/all', ensureAuth, ensureManager, async (req, res) => {
  try {
    const queries = await Query.find().sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, queries });
  } catch (err) {
    console.error('GET /api/queries/manager/all error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
    