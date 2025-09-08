import express from 'express';
import { createDynamicModel, createModelFromDefinition, ModelFactory } from '../utils/modelFactory.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/dynamic-models
 * Create a new model dynamically
 * Body: { name: string, schema: object, collectionName?: string, options?: object }
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, schema, collectionName, options = {} } = req.body;

    if (!name || !schema) {
      return res.status(400).json({
        success: false,
        message: 'Model name and schema are required'
      });
    }

    const model = await createModelFromDefinition(name, schema, collectionName, options);
    
    res.status(201).json({
      success: true,
      message: `Model '${name}' created successfully`,
      modelName: name,
      collectionName: collectionName || name.toLowerCase()
    });
  } catch (error) {
    console.error('Create dynamic model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dynamic model',
      error: error.message
    });
  }
});

/**
 * POST /api/dynamic-models/simple
 * Create a simple model with basic fields
 * Body: { name: string, fields?: object, collectionName?: string }
 */
router.post('/simple', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, fields = {}, collectionName } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Model name is required'
      });
    }

    const model = await ModelFactory.createSimple(name, fields, collectionName);
    
    res.status(201).json({
      success: true,
      message: `Simple model '${name}' created successfully`,
      modelName: name,
      collectionName: collectionName || name.toLowerCase()
    });
  } catch (error) {
    console.error('Create simple model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create simple model',
      error: error.message
    });
  }
});

/**
 * POST /api/dynamic-models/user-related
 * Create a user-related model
 * Body: { name: string, fields?: object, collectionName?: string }
 */
router.post('/user-related', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, fields = {}, collectionName } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Model name is required'
      });
    }

    const model = await ModelFactory.createUserRelated(name, fields, collectionName);
    
    res.status(201).json({
      success: true,
      message: `User-related model '${name}' created successfully`,
      modelName: name,
      collectionName: collectionName || name.toLowerCase()
    });
  } catch (error) {
    console.error('Create user-related model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user-related model',
      error: error.message
    });
  }
});

/**
 * POST /api/dynamic-models/content
 * Create a content model
 * Body: { name: string, fields?: object, collectionName?: string }
 */
router.post('/content', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, fields = {}, collectionName } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Model name is required'
      });
    }

    const model = await ModelFactory.createContent(name, fields, collectionName);
    
    res.status(201).json({
      success: true,
      message: `Content model '${name}' created successfully`,
      modelName: name,
      collectionName: collectionName || name.toLowerCase()
    });
  } catch (error) {
    console.error('Create content model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content model',
      error: error.message
    });
  }
});

/**
 * POST /api/dynamic-models/transaction
 * Create a transaction model
 * Body: { name: string, fields?: object, collectionName?: string }
 */
router.post('/transaction', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, fields = {}, collectionName } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Model name is required'
      });
    }

    const model = await ModelFactory.createTransaction(name, fields, collectionName);
    
    res.status(201).json({
      success: true,
      message: `Transaction model '${name}' created successfully`,
      modelName: name,
      collectionName: collectionName || name.toLowerCase()
    });
  } catch (error) {
    console.error('Create transaction model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction model',
      error: error.message
    });
  }
});

/**
 * GET /api/dynamic-models/templates
 * Get available model templates
 */
router.get('/templates', authenticateToken, (req, res) => {
  const templates = {
    simple: {
      description: 'Basic model with name, description, and isActive fields',
      fields: {
        name: { type: 'String', required: true },
        description: { type: 'String' },
        isActive: { type: 'Boolean', default: true }
      }
    },
    userRelated: {
      description: 'Model with user references and audit fields',
      fields: {
        userId: { type: 'ObjectId', ref: 'User', required: true },
        createdBy: { type: 'ObjectId', ref: 'User' },
        updatedBy: { type: 'ObjectId', ref: 'User' }
      }
    },
    content: {
      description: 'Content model for posts, articles, etc.',
      fields: {
        title: { type: 'String', required: true },
        content: { type: 'String', required: true },
        author: { type: 'ObjectId', ref: 'User', required: true },
        tags: { type: '[String]' },
        isPublished: { type: 'Boolean', default: false },
        views: { type: 'Number', default: 0 },
        likes: { type: 'Number', default: 0 }
      }
    },
    transaction: {
      description: 'Transaction/audit model',
      fields: {
        type: { type: 'String', required: true },
        amount: { type: 'Number' },
        currency: { type: 'String', default: 'USD' },
        fromUser: { type: 'ObjectId', ref: 'User' },
        toUser: { type: 'ObjectId', ref: 'User' },
        status: { type: 'String', enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
        reference: { type: 'String' },
        metadata: { type: 'Mixed' }
      }
    }
  };

  res.json({
    success: true,
    templates
  });
});

export default router;
