import mongoose from 'mongoose';
import { createModelWithCollection, ensureCollection } from './collectionManager.js';

/**
 * Model Factory for creating dynamic Mongoose models with automatic collection creation
 */

/**
 * Creates a model with automatic collection creation
 * @param {string} modelName - Name of the model (e.g., 'User', 'Product')
 * @param {mongoose.Schema} schema - Mongoose schema definition
 * @param {string} collectionName - Custom collection name (optional)
 * @param {object} options - Collection creation options
 * @returns {Promise<mongoose.Model>} - Mongoose model
 */
export const createDynamicModel = async (modelName, schema, collectionName = null, options = {}) => {
  try {
    const finalCollectionName = collectionName || modelName.toLowerCase();
    
    // Ensure collection exists
    await ensureCollection(finalCollectionName, options);
    
    // Create and return the model
    const model = mongoose.model(modelName, schema, finalCollectionName);
    console.log(`✅ Created dynamic model: ${modelName} -> collection: ${finalCollectionName}`);
    
    return model;
  } catch (error) {
    console.error(`❌ Failed to create dynamic model ${modelName}:`, error);
    throw error;
  }
};

/**
 * Creates a model from a schema definition object
 * @param {string} modelName - Name of the model
 * @param {object} schemaDefinition - Schema definition object
 * @param {string} collectionName - Custom collection name (optional)
 * @param {object} options - Collection creation options
 * @returns {Promise<mongoose.Model>} - Mongoose model
 */
export const createModelFromDefinition = async (modelName, schemaDefinition, collectionName = null, options = {}) => {
  try {
    const schema = new mongoose.Schema(schemaDefinition, {
      timestamps: true, // Automatically add createdAt and updatedAt
      ...options.schemaOptions
    });
    
    return await createDynamicModel(modelName, schema, collectionName, options);
  } catch (error) {
    console.error(`❌ Failed to create model from definition ${modelName}:`, error);
    throw error;
  }
};

/**
 * Creates multiple models at once
 * @param {Array} modelDefinitions - Array of model definitions
 * @returns {Promise<object>} - Object with model names as keys and models as values
 */
export const createMultipleModels = async (modelDefinitions) => {
  const models = {};
  
  for (const definition of modelDefinitions) {
    const { name, schema, collectionName, options = {} } = definition;
    
    try {
      models[name] = await createDynamicModel(name, schema, collectionName, options);
    } catch (error) {
      console.error(`Failed to create model ${name}:`, error);
      models[name] = null;
    }
  }
  
  return models;
};

/**
 * Factory function for common model patterns
 */
export const ModelFactory = {
  /**
   * Creates a simple model with basic fields
   * @param {string} name - Model name
   * @param {object} fields - Additional fields to add to basic schema
   * @param {string} collectionName - Collection name
   * @returns {Promise<mongoose.Model>}
   */
  createSimple: async (name, fields = {}, collectionName = null) => {
    const basicSchema = {
      name: { type: String, required: true },
      description: { type: String },
      isActive: { type: Boolean, default: true },
      ...fields
    };
    
    return await createModelFromDefinition(name, basicSchema, collectionName);
  },

  /**
   * Creates a user-related model
   * @param {string} name - Model name
   * @param {object} fields - Additional fields
   * @param {string} collectionName - Collection name
   * @returns {Promise<mongoose.Model>}
   */
  createUserRelated: async (name, fields = {}, collectionName = null) => {
    const userSchema = {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      ...fields
    };
    
    return await createModelFromDefinition(name, userSchema, collectionName);
  },

  /**
   * Creates a content model (for posts, articles, etc.)
   * @param {string} name - Model name
   * @param {object} fields - Additional fields
   * @param {string} collectionName - Collection name
   * @returns {Promise<mongoose.Model>}
   */
  createContent: async (name, fields = {}, collectionName = null) => {
    const contentSchema = {
      title: { type: String, required: true },
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      tags: [{ type: String }],
      isPublished: { type: Boolean, default: false },
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      ...fields
    };
    
    return await createModelFromDefinition(name, contentSchema, collectionName);
  },

  /**
   * Creates a transaction/audit model
   * @param {string} name - Model name
   * @param {object} fields - Additional fields
   * @param {string} collectionName - Collection name
   * @returns {Promise<mongoose.Model>}
   */
  createTransaction: async (name, fields = {}, collectionName = null) => {
    const transactionSchema = {
      type: { type: String, required: true },
      amount: { type: Number },
      currency: { type: String, default: 'USD' },
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
      reference: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed },
      ...fields
    };
    
    return await createModelFromDefinition(name, transactionSchema, collectionName);
  }
};

/**
 * Middleware for automatic model creation
 * @param {string} modelName - Name of the model
 * @param {object} schemaDefinition - Schema definition
 * @param {string} collectionName - Collection name
 * @returns {Function} - Express middleware
 */
export const autoCreateModel = (modelName, schemaDefinition, collectionName = null) => {
  let model = null;
  
  return async (req, res, next) => {
    try {
      if (!model) {
        model = await createModelFromDefinition(modelName, schemaDefinition, collectionName);
      }
      
      req.model = model;
      next();
    } catch (error) {
      console.error(`Auto-create model failed for '${modelName}':`, error);
      res.status(500).json({
        message: 'Failed to create model',
        error: error.message
      });
    }
  };
};

export default {
  createDynamicModel,
  createModelFromDefinition,
  createMultipleModels,
  ModelFactory,
  autoCreateModel
};
