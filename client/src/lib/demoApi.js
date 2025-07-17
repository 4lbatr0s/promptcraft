const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class DemoApiClient {
  constructor() {
    this.demoToken = localStorage.getItem('promptcraft_demo_token');
  }

  // Generate a new demo token
  async generateToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        this.demoToken = data.data.token;
        
        localStorage.setItem('promptcraft_demo_token', this.demoToken);
        
        return data.data.token;
      } else {
        throw new Error(data.error || 'Failed to generate token');
      }
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }

  // Check demo usage
  async checkUsage() {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/usage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to check usage');
      }
    } catch (error) {
      console.error('Usage check error:', error);
      throw error;
    }
  }

  // Convert prompt using demo API
  async convertPrompt(prompt) {
    try {
      if (!this.demoToken) {
        await this.generateToken();
      }

      const response = await fetch(`${API_BASE_URL}/demo/convert-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Demo-Token': this.demoToken,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        // If token is invalid, try to generate a new one
        if (response.status === 401 || response.status === 429) {
          localStorage.removeItem('promptcraft_demo_token');
          this.demoToken = null;
          
          if (response.status === 429) {
            throw new Error('Demo limit reached. Please sign up for unlimited access.');
          }
        }
        
        throw new Error(data.error || 'Failed to convert prompt');
      }
    } catch (error) {
      console.error('Prompt conversion error:', error);
      throw error;
    }
  }

  // Clear demo token
  clearToken() {
    this.demoToken = null;
    localStorage.removeItem('promptcraft_demo_token');
  }
}

export default new DemoApiClient(); 