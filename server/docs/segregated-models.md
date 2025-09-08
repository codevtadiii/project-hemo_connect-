# Segregated Data Models Documentation

This document outlines the segregated data models for better organization and query efficiency in the blood donation system.

## Overview

The system now uses three separate, specialized models instead of mixing different types of data:

1. **ContactMessage** - For contact form submissions and inquiries
2. **BloodRequest** - For blood donation requests and matching
3. **DonorBlood** - For donor blood profiles and donation history

## 1. ContactMessage Model

**Collection:** `contactmessages`

### Purpose
Handles all contact form submissions, support requests, feedback, and general inquiries.

### Key Features
- **Categorization**: general, support, feedback, complaint, suggestion, partnership, media
- **Priority Levels**: low, medium, high, urgent
- **Status Tracking**: new, in_progress, responded, resolved, closed
- **Response Management**: Track responses and who responded
- **Source Tracking**: website, mobile_app, api, admin_panel

### API Endpoints
- `POST /api/contact` - Submit contact message
- `GET /api/contact` - Get all messages (admin)
- `GET /api/contact/:id` - Get specific message
- `PATCH /api/contact/:id/status` - Update message status

### Example Usage
```javascript
// Submit contact message
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'General Inquiry',
    message: 'I have a question about blood donation',
    category: 'general',
    priority: 'medium'
  })
});
```

## 2. BloodRequest Model

**Collection:** `bloodrequests`

### Purpose
Manages blood donation requests, donor responses, and matching process.

### Key Features
- **Comprehensive Request Data**: Blood group, units, urgency, hospital details
- **Donor Response Tracking**: Accept/decline responses with details
- **Status Management**: pending, matched, confirmed, in_progress, fulfilled, cancelled, expired
- **Location-based Matching**: Find nearby donors
- **Medical Information**: Hospital, doctor, medical conditions
- **Expiration Handling**: Automatic expiration of old requests

### API Endpoints
- `POST /api/blood-requests` - Create blood request
- `GET /api/blood-requests/active` - Get active requests (ticker)
- `GET /api/blood-requests/nearby` - Get nearby requests for donors
- `GET /api/blood-requests/my-requests` - Get user's requests
- `GET /api/blood-requests/my-history` - Get user's request history
- `GET /api/blood-requests/:id` - Get specific request
- `POST /api/blood-requests/:id/respond` - Respond to request (donor)
- `POST /api/blood-requests/:id/confirm-donor` - Confirm donor
- `POST /api/blood-requests/:id/cancel` - Cancel request
- `POST /api/blood-requests/:id/fulfill` - Mark as fulfilled

### Example Usage
```javascript
// Create blood request
const response = await fetch('/api/blood-requests', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    bloodGroup: 'O+',
    units: 2,
    urgencyLevel: 'high',
    hospital: 'City Hospital',
    hospitalAddress: '123 Main St',
    doctorName: 'Dr. Smith',
    contactNumber: '+1234567890',
    requiredByDate: '2024-01-15',
    additionalNotes: 'Patient needs urgent surgery'
  })
});
```

## 3. DonorBlood Model

**Collection:** `donorblood`

### Purpose
Manages donor blood profiles, eligibility, donation history, and availability.

### Key Features
- **Comprehensive Medical History**: Diabetes, hypertension, medications, allergies
- **Physical Information**: Age, weight, height, gender
- **Donation History**: Complete record of all donations
- **Eligibility Tracking**: Automatic eligibility calculation based on last donation
- **Availability Management**: Preferred locations, time slots, emergency availability
- **Statistics**: Response rates, total donations, activity tracking
- **Verification System**: Admin verification and certification

### API Endpoints
- `POST /api/donor-blood` - Create/update donor profile
- `GET /api/donor-blood/my-profile` - Get own profile
- `GET /api/donor-blood/eligible/:bloodGroup` - Get eligible donors
- `GET /api/donor-blood/available` - Get available donors
- `GET /api/donor-blood/emergency/:bloodGroup` - Get emergency donors
- `PATCH /api/donor-blood/availability` - Update availability
- `POST /api/donor-blood/donation` - Add donation record
- `GET /api/donor-blood/donation-history` - Get donation history
- `PATCH /api/donor-blood/stats` - Update statistics
- `PATCH /api/donor-blood/:id/suspend` - Suspend donor (admin)
- `PATCH /api/donor-blood/:id/activate` - Activate donor (admin)

### Example Usage
```javascript
// Create donor blood profile
const response = await fetch('/api/donor-blood', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    bloodGroup: 'O+',
    rhFactor: 'positive',
    physicalInfo: {
      age: 25,
      weight: 70,
      height: 175,
      gender: 'male'
    },
    medicalHistory: {
      hasDiabetes: false,
      hasHypertension: false,
      medications: []
    },
    availability: {
      isAvailable: true,
      preferredLocations: ['Downtown', 'Medical District'],
      maxDistance: 30,
      emergencyOnly: false
    }
  })
});
```

## Database Collections

The system now creates these collections automatically:

1. **users** - User accounts and basic information
2. **bloodrequests** - Blood donation requests
3. **contactmessages** - Contact form submissions
4. **donorblood** - Donor blood profiles and history
5. **notifications** - System notifications
6. **contacts** - Legacy contact data (deprecated)

## Benefits of Segregation

### 1. **Improved Query Performance**
- Smaller, focused collections
- Optimized indexes for specific use cases
- Faster data retrieval

### 2. **Better Data Organization**
- Clear separation of concerns
- Easier to maintain and understand
- Reduced data redundancy

### 3. **Enhanced Security**
- Role-based access control
- Sensitive medical data isolation
- Better audit trails

### 4. **Scalability**
- Independent scaling of different data types
- Easier to implement caching strategies
- Better resource utilization

### 5. **Data Integrity**
- Specific validation rules for each model
- Better error handling
- Consistent data structure

## Migration Notes

### From Old System
- Contact form submissions now go to `contactmessages` collection
- Blood requests use the new `bloodrequests` collection
- Donor data is stored in `donorblood` collection
- Legacy `contacts` collection is maintained for backward compatibility

### API Changes
- Contact form: Enhanced with categorization and priority
- Blood requests: More comprehensive data structure
- Donor profiles: Complete medical and donation history

## Indexes and Performance

### ContactMessage Indexes
- `email`, `status`, `category`, `priority`, `createdAt`

### BloodRequest Indexes
- `requesterId`, `bloodGroup`, `location`, `status`, `urgencyLevel`, `requiredByDate`

### DonorBlood Indexes
- `donorId`, `bloodGroup`, `isEligible`, `availability.isAvailable`, `nextEligibleDate`

## Best Practices

1. **Use appropriate endpoints** for each data type
2. **Implement proper validation** on the frontend
3. **Handle errors gracefully** with specific error messages
4. **Use pagination** for large data sets
5. **Implement caching** for frequently accessed data
6. **Monitor performance** and optimize queries as needed

## Future Enhancements

1. **Real-time notifications** for blood requests
2. **Advanced matching algorithms** for donor-request pairing
3. **Analytics dashboard** for system insights
4. **Mobile app integration** with push notifications
5. **Integration with blood banks** and hospitals
