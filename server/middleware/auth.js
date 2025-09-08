import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    try {
      console.log('Decoded JWT:', decoded);
      let userId = decoded.userId;
      if (typeof userId !== 'string') userId = String(userId);
      // Validate ObjectId format
      if (!userId.match(/^[a-fA-F0-9]{24}$/)) {
        console.error('Invalid userId in JWT:', userId);
        return res.status(400).json({ message: 'Invalid user ID in token' });
      }
      const user = await User.findById(userId);
      console.log('Authenticated user lookup for:', userId, 'Result:', user);
      if (!user) {
        return res.status(404).json({ message: 'User not found', userId });
      }
      req.user = user;
      next();
    } catch (error) {
      console.log('Error during user lookup:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Server error'));
    }
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ 
        message: `Access denied. ${role} role required.` 
      });
    }
    next();
  };
};

const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. One of these roles required: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

export {
  authenticateToken,
  authenticateSocket,
  requireRole,
  requireRoles,
  JWT_SECRET,
};