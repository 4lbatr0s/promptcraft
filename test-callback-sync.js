#!/usr/bin/env node

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:8080/api'

async function testCallbackSync() {
  console.log('🧪 Testing Callback-Based User Synchronization...\n')

  const testUser = {
    kindeId: 'test_user_123',
    email: 'test@example.com',
    givenName: 'Test',
    familyName: 'User',
    picture: 'https://example.com/avatar.jpg',
    isEmailVerified: true
  }

  try {
    console.log('📤 Sending user sync request...')
    const response = await fetch(`${API_BASE}/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ User sync successful!')
      console.log('📊 Response:', JSON.stringify(result, null, 2))
    } else {
      console.log('❌ User sync failed:', result.error)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run the test
testCallbackSync() 