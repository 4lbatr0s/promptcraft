# Eventual Consistency Pattern for User Management

## Overview

This system implements an eventual consistency pattern for managing users between Kinde (authentication provider) and our MongoDB database. This ensures that user data is eventually synchronized even if webhooks fail or users register before webhooks are configured.

## Architecture

### 1. Primary Flow: Webhook-Based Synchronization

```
Kinde User Registration → Webhook → MongoDB User Creation
```

- **Webhook Endpoint**: `/api/webhook`
- **Events Handled**: `user.created`, `user.updated`, `user.deleted`
- **Security**: HMAC-SHA256 signature verification
- **Idempotency**: Safe to retry, handles duplicate events

### 2. Fallback Flow: On-Demand User Creation

```
User Login → Check MongoDB → Create User if Missing
```

- **Trigger**: Every authenticated request
- **Location**: `authMiddleware` in `kindeAuth.js`
- **Purpose**: Handles cases where webhook failed or wasn't configured

### 3. Manual Sync: API Endpoint

```
GET /api/profile → Create/Update User → Return Profile
```

- **Endpoint**: `/api/profile`
- **Purpose**: Manual synchronization and profile retrieval
- **Authentication**: Required

## Implementation Details

### Webhook Handler (`webhookController.js`)

```javascript
// Handles Kinde webhook events
export const handleWebhook = async (req, res) => {
  // 1. Verify webhook signature
  // 2. Route to appropriate handler based on event type
  // 3. Create or update user in MongoDB
}
```

### User Service (`userService.js`)

```javascript
// Idempotent user creation/update
export async function createOrUpdateUser(userData) {
  // 1. Try to find existing user by kindeId or email
  // 2. Update existing user or create new one
  // 3. Handle conflicts gracefully
}
```

### Authentication Middleware (`kindeAuth.js`)

```javascript
// Enhanced middleware with database integration
export async function authMiddleware(req, res, next) {
  // 1. Validate token
  // 2. Check if user exists in MongoDB
  // 3. Create user if missing (fallback)
  // 4. Update last login time
}
```

## Benefits of This Pattern

### 1. **Reliability**
- Webhooks provide real-time synchronization
- Fallback ensures users can always access the system
- Multiple layers of redundancy

### 2. **Performance**
- No blocking operations during authentication
- Asynchronous webhook processing
- Cached user data in middleware

### 3. **Scalability**
- Stateless webhook handlers
- Database indexes for fast lookups
- Graceful degradation

### 4. **Data Integrity**
- Idempotent operations prevent duplicates
- Conflict resolution for concurrent updates
- Audit trail with timestamps

## Configuration

### Kinde Webhook Setup

1. **Configure Webhook URL**: `https://your-domain.com/api/webhook`
2. **Select Events**: `user.created`, `user.updated`, `user.deleted`
3. **Set Webhook Secret**: Add to environment variables
4. **Test Webhook**: Use Kinde's webhook testing feature

### Environment Variables

```env
KINDE_WEBHOOK_SECRET=your_webhook_secret
MONGODB_URI=your_mongodb_connection_string
```

## Error Handling

### Webhook Failures
- **Retry Logic**: Kinde automatically retries failed webhooks
- **Logging**: All webhook events are logged for debugging
- **Graceful Degradation**: System continues to work even if webhooks fail

### Database Failures
- **Fallback**: Authentication continues with Kinde data only
- **Recovery**: Users are created on next successful request
- **Monitoring**: Database errors are logged and monitored

### Network Issues
- **Timeout Handling**: Webhook processing has timeouts
- **Circuit Breaker**: Prevents cascading failures
- **Health Checks**: Monitor webhook endpoint health

## Monitoring and Debugging

### Logs to Monitor
- Webhook signature verification failures
- User creation/update operations
- Database connection issues
- Authentication middleware errors

### Metrics to Track
- Webhook success/failure rates
- User creation latency
- Database query performance
- Authentication success rates

## Best Practices

### 1. **Webhook Security**
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Rotate webhook secrets regularly

### 2. **Database Design**
- Use unique indexes on `kindeId` and `email`
- Include timestamps for audit trails
- Implement soft deletes for user data

### 3. **Error Handling**
- Log all errors with context
- Implement retry mechanisms
- Provide fallback behaviors

### 4. **Performance**
- Index frequently queried fields
- Cache user data when appropriate
- Use connection pooling for database

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook URL configuration
   - Verify webhook secret
   - Check server logs for errors

2. **Users Not Created in Database**
   - Verify MongoDB connection
   - Check webhook event logs
   - Test fallback creation manually

3. **Authentication Failures**
   - Check token validation logic
   - Verify database connectivity
   - Review middleware logs

### Debug Commands

```bash
# Test webhook endpoint
curl -X POST http://localhost:5000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-kinde-signature: test" \
  -d '{"type":"user.created","user":{"id":"test","email":"test@example.com"}}'

# Test user profile endpoint
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer test-token"
```

## Future Enhancements

1. **Event Sourcing**: Store all user events for audit
2. **CQRS**: Separate read/write models for better performance
3. **Message Queue**: Use Redis/RabbitMQ for webhook processing
4. **Real-time Updates**: WebSocket notifications for user changes
5. **Analytics**: Track user behavior and system performance 