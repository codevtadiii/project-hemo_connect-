import mongoose from 'mongoose';

/**
 * Dynamic Collection Manager
 * Handles creation and management of MongoDB collections on-demand
 */

// Cache for created collections to avoid redundant operations
const createdCollections = new Set();

/**
 * Validates collection name according to MongoDB naming rules
 * @param {string} name - Collection name to validate
 * @returns {object} - { isValid: boolean, error?: string }
 */
export const validateCollectionName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Collection name must be a non-empty string' };
  }

  // MongoDB collection name rules
  const rules = [
    { test: name.length === 0, error: 'Collection name cannot be empty' },
    { test: name.length > 120, error: 'Collection name cannot exceed 120 characters' },
    { test: name.startsWith('$'), error: 'Collection name cannot start with $' },
    { test: name.includes('..'), error: 'Collection name cannot contain ..' },
    { test: name.includes('\0'), error: 'Collection name cannot contain null character' },
    { test: /[<>:"/\\|?*]/.test(name), error: 'Collection name contains invalid characters' },
    { test: name.trim() !== name, error: 'Collection name cannot have leading/trailing spaces' }
  ];

  for (const rule of rules) {
    if (rule.test) {
      return { isValid: false, error: rule.error };
    }
  }

  return { isValid: true };
};

/**
 * Creates a collection if it doesn't exist
 * @param {string} collectionName - Name of the collection to create
 * @param {object} options - Additional options for collection creation
 * @returns {Promise<object>} - { success: boolean, message: string, collectionName?: string }
 */
export const createCollection = async (collectionName, options = {}) => {
  try {
    // Validate collection name
    const validation = validateCollectionName(collectionName);
    if (!validation.isValid) {
      return { success: false, message: validation.error };
    }

    // Check if already created in this session
    if (createdCollections.has(collectionName)) {
      return { 
        success: true, 
        message: `Collection '${collectionName}' already exists in this session`,
        collectionName 
      };
    }

    // Check if collection already exists in database
    const db = mongoose.connection.db;
    if (!db) {
      return { success: false, message: 'Database connection not available' };
    }

    const existingCollections = await db.listCollections({ name: collectionName }).toArray();
    if (existingCollections.length > 0) {
      createdCollections.add(collectionName);
      return { 
        success: true, 
        message: `Collection '${collectionName}' already exists in database`,
        collectionName 
      };
    }

    // Create the collection
    await db.createCollection(collectionName, {
      validator: options.validator || {},
      validationLevel: options.validationLevel || 'strict',
      validationAction: options.validationAction || 'error',
      ...options
    });

    createdCollections.add(collectionName);
    console.log(`✅ Created collection: ${collectionName}`);
    
    return { 
      success: true, 
      message: `Collection '${collectionName}' created successfully`,
      collectionName 
    };

  } catch (error) {
    console.error(`❌ Failed to create collection '${collectionName}':`, error);
    return { 
      success: false, 
      message: `Failed to create collection: ${error.message}` 
    };
  }
};

/**
 * Creates multiple collections at once
 * @param {string[]} collectionNames - Array of collection names
 * @param {object} options - Options for all collections
 * @returns {Promise<object>} - Results for each collection
 */
export const createMultipleCollections = async (collectionNames, options = {}) => {
  const results = {};
  
  for (const name of collectionNames) {
    results[name] = await createCollection(name, options);
  }
  
  return results;
};

/**
 * Ensures a collection exists before performing operations
 * @param {string} collectionName - Name of the collection
 * @param {object} options - Creation options
 * @returns {Promise<boolean>} - True if collection exists or was created successfully
 */
export const ensureCollection = async (collectionName, options = {}) => {
  const result = await createCollection(collectionName, options);
  return result.success;
};

/**
 * Gets list of all collections in the database
 * @returns {Promise<string[]>} - Array of collection names
 */
export const listCollections = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collections = await db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('Failed to list collections:', error);
    throw error;
  }
};

/**
 * Drops a collection (use with caution)
 * @param {string} collectionName - Name of the collection to drop
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
export const dropCollection = async (collectionName) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return { success: false, message: 'Database connection not available' };
    }

    await db.dropCollection(collectionName);
    createdCollections.delete(collectionName);
    console.log(`🗑️ Dropped collection: ${collectionName}`);
    
    return { 
      success: true, 
      message: `Collection '${collectionName}' dropped successfully` 
    };
  } catch (error) {
    console.error(`Failed to drop collection '${collectionName}':`, error);
    return { 
      success: false, 
      message: `Failed to drop collection: ${error.message}` 
    };
  }
};

/**
 * Creates a Mongoose model with dynamic collection creation
 * @param {string} modelName - Name of the model
 * @param {mongoose.Schema} schema - Mongoose schema
 * @param {string} collectionName - Name of the collection (optional, defaults to modelName)
 * @param {object} options - Collection creation options
 * @returns {mongoose.Model} - Mongoose model
 */
export const createModelWithCollection = async (modelName, schema, collectionName = null, options = {}) => {
  const finalCollectionName = collectionName || modelName.toLowerCase();
  
  // Ensure collection exists
  await ensureCollection(finalCollectionName, options);
  
  // Create and return the model
  return mongoose.model(modelName, schema, finalCollectionName);
};

/**
 * Middleware for automatic collection creation on model operations
 * @param {string} collectionName - Name of the collection
 * @param {object} options - Collection creation options
 * @returns {Function} - Express middleware function
 */
export const autoCreateCollection = (collectionName, options = {}) => {
  return async (req, res, next) => {
    try {
      await ensureCollection(collectionName, options);
      next();
    } catch (error) {
      console.error(`Auto-create collection failed for '${collectionName}':`, error);
      res.status(500).json({ 
        message: 'Failed to ensure collection exists',
        error: error.message 
      });
    }
  };
};

export default {
  validateCollectionName,
  createCollection,
  createMultipleCollections,
  ensureCollection,
  listCollections,
  dropCollection,
  createModelWithCollection,
  autoCreateCollection
};
