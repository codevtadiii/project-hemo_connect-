# Dynamic Collection and Model Management API

This system allows developers and users to create MongoDB collections and Mongoose models dynamically at runtime.

## Collection Management API

### Base URL: `/api/collections`

#### 1. List All Collections
```http
GET /api/collections
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "collections": ["users", "bloodrequests", "notifications", "contacts"],
  "count": 4
}
```

#### 2. Create a Single Collection
```http
POST /api/collections
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "products",
  "options": {
    "validator": {
      "name": { "$type": "string", "$exists": true }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collection 'products' created successfully",
  "collectionName": "products"
}
```

#### 3. Create Multiple Collections
```http
POST /api/collections/batch
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "names": ["products", "categories", "orders"],
  "options": {
    "validationLevel": "strict"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Created 3/3 collections",
  "results": {
    "products": { "success": true, "message": "Collection 'products' created successfully" },
    "categories": { "success": true, "message": "Collection 'categories' created successfully" },
    "orders": { "success": true, "message": "Collection 'orders' created successfully" }
  }
}
```

#### 4. Ensure Collection Exists
```http
POST /api/collections/ensure
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "user_preferences",
  "options": {}
}
```

#### 5. Validate Collection Name
```http
POST /api/collections/validate
Content-Type: application/json

{
  "name": "my_collection"
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "error": null
}
```

#### 6. Drop Collection (Admin Only)
```http
DELETE /api/collections/products
Authorization: Bearer <admin_token>
```

## Dynamic Model Management API

### Base URL: `/api/dynamic-models`

#### 1. Create Custom Model
```http
POST /api/dynamic-models
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product",
  "collectionName": "products",
  "schema": {
    "name": { "type": "String", "required": true },
    "price": { "type": "Number", "required": true },
    "category": { "type": "String" },
    "inStock": { "type": "Boolean", "default": true }
  },
  "options": {
    "schemaOptions": {
      "timestamps": true
    }
  }
}
```

#### 2. Create Simple Model
```http
POST /api/dynamic-models/simple
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Category",
  "fields": {
    "color": { "type": "String" },
    "icon": { "type": "String" }
  },
  "collectionName": "categories"
}
```

#### 3. Create User-Related Model
```http
POST /api/dynamic-models/user-related
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "UserPreference",
  "fields": {
    "theme": { "type": "String", "default": "light" },
    "notifications": { "type": "Boolean", "default": true }
  }
}
```

#### 4. Create Content Model
```http
POST /api/dynamic-models/content
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "BlogPost",
  "fields": {
    "excerpt": { "type": "String" },
    "featuredImage": { "type": "String" }
  }
}
```

#### 5. Create Transaction Model
```http
POST /api/dynamic-models/transaction
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Payment",
  "fields": {
    "paymentMethod": { "type": "String", "required": true },
    "transactionId": { "type": "String", "unique": true }
  }
}
```

#### 6. Get Model Templates
```http
GET /api/dynamic-models/templates
Authorization: Bearer <token>
```

## Usage Examples

### JavaScript/Node.js

```javascript
// Create a collection
const response = await fetch('/api/collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    name: 'inventory',
    options: {
      validator: {
        name: { $type: 'string', $exists: true },
        quantity: { $type: 'number', $gte: 0 }
      }
    }
  })
});

// Create a dynamic model
const modelResponse = await fetch('/api/dynamic-models/simple', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    name: 'Inventory',
    fields: {
      sku: { type: 'String', required: true, unique: true },
      quantity: { type: 'Number', default: 0 },
      reorderLevel: { type: 'Number', default: 10 }
    },
    collectionName: 'inventory'
  })
});
```

### cURL Examples

```bash
# Create a collection
curl -X POST http://localhost:5000/api/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"name": "events", "options": {}}'

# Create a simple model
curl -X POST http://localhost:5000/api/dynamic-models/simple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"name": "Event", "fields": {"date": {"type": "Date", "required": true}}}'

# List all collections
curl -X GET http://localhost:5000/api/collections \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Collection Name Validation Rules

- Must be a non-empty string
- Cannot exceed 120 characters
- Cannot start with `$`
- Cannot contain `..` or null characters
- Cannot contain invalid characters: `< > : " / \ | ? *`
- Cannot have leading or trailing spaces

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Security

- Collection creation requires admin role
- Collection listing requires admin role
- Collection dropping requires admin role
- Model creation requires admin role
- Collection validation is public (no auth required)
- Collection ensuring requires authentication (any role)

## Best Practices

1. **Use descriptive names**: Choose clear, descriptive collection and model names
2. **Validate schemas**: Always validate your schema definitions before creating models
3. **Handle errors**: Always handle potential errors when creating collections/models
4. **Use templates**: Leverage the built-in model templates for common patterns
5. **Monitor usage**: Keep track of dynamically created collections to avoid clutter
