import express from 'express';
import { 
  createCollection, 
  createMultipleCollections, 
  listCollections, 
  dropCollection, 
  validateCollectionName,
  ensureCollection 
} from '../utils/collectionManager.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/collections
 * List all collections in the database
 */
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const collections = await listCollections();
    res.json({
      success: true,
      collections,
      count: collections.length
    });
  } catch (error) {
    console.error('List collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list collections',
      error: error.message
    });
  }
});

/**
 * POST /api/collections
 * Create a new collection
 * Body: { name: string, options?: object }
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, options = {} } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    const result = await createCollection(name, options);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collection',
      error: error.message
    });
  }
});

/**
 * POST /api/collections/batch
 * Create multiple collections at once
 * Body: { names: string[], options?: object }
 */
router.post('/batch', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { names, options = {} } = req.body;

    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of collection names is required'
      });
    }

    // Validate all names first
    const validationErrors = [];
    for (const name of names) {
      const validation = validateCollectionName(name);
      if (!validation.isValid) {
        validationErrors.push({ name, error: validation.error });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some collection names are invalid',
        errors: validationErrors
      });
    }

    const results = await createMultipleCollections(names, options);
    const successCount = Object.values(results).filter(r => r.success).length;
    
    res.status(201).json({
      success: true,
      message: `Created ${successCount}/${names.length} collections`,
      results
    });
  } catch (error) {
    console.error('Batch create collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collections',
      error: error.message
    });
  }
});

/**
 * POST /api/collections/ensure
 * Ensure a collection exists (create if it doesn't)
 * Body: { name: string, options?: object }
 */
router.post('/ensure', authenticateToken, async (req, res) => {
  try {
    const { name, options = {} } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    const result = await createCollection(name, options);
    res.json(result);
  } catch (error) {
    console.error('Ensure collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ensure collection exists',
      error: error.message
    });
  }
});

/**
 * DELETE /api/collections/:name
 * Drop a collection (admin only)
 */
router.delete('/:name', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    const result = await dropCollection(name);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Drop collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to drop collection',
      error: error.message
    });
  }
});

/**
 * POST /api/collections/validate
 * Validate a collection name
 * Body: { name: string }
 */
router.post('/validate', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required'
      });
    }

    const validation = validateCollectionName(name);
    res.json({
      success: true,
      isValid: validation.isValid,
      error: validation.error || null
    });
  } catch (error) {
    console.error('Validate collection name error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate collection name',
      error: error.message
    });
  }
});

export default router;
