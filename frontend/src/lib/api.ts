const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;

    // Load token from localStorage on initialization
    this.token = localStorage.getItem('fuel_buddy_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('fuel_buddy_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('fuel_buddy_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Build headers - make sure options.headers merges properly
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add token if available (from apiClient's token property)
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add any custom headers from options - but don't override Authorization unless explicitly provided
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (key === 'Authorization' && value) {
          // Custom authorization header takes precedence
          headers[key] = value;
        } else if (key !== 'Authorization') {
          headers[key] = value;
        }
      });
    }

    // Build final config - remove headers from options to avoid duplication
    const { headers: optionsHeaders, ...restOptions } = options;

    const config: RequestInit = {
      headers,
      ...restOptions,
    };

    console.log(`Making request to: ${url}`);
    console.log(`Token being sent: ${this.token ? 'Present' : 'None'}`);
    if (this.token) {
      console.log(`Token first 20 chars: ${this.token.substring(0, 20)}...`);
    }
    console.log(`Request headers:`, config.headers);

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Request failed with status ${response.status}:`, errorData);

        // Handle 401 specifically for token issues
        if (response.status === 401) {
          console.log('401 Unauthorized - token may be expired or invalid');
          // Clear token from localStorage and apiClient
          this.removeToken();
          localStorage.removeItem('fuel_buddy_token');
          localStorage.removeItem('fuel_buddy_user');
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Response for ${endpoint} is not JSON. Content-Type: ${contentType}`);
        // Return an empty object or appropriate default for non-JSON responses
        return {} as T;
      }

      const responseData = await response.json();

      // Validate response format and return appropriate data
      return this.validateResponseFormat<T>(responseData, endpoint);
    } catch (error) {
      console.error('API request failed:', error);
      // Return mock data for development when backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Mocking response for ${endpoint} since backend is not available`);
        const mockData = this.getMockData(endpoint);
        // Ensure we always return the correct type
        return mockData as unknown as T;
      }
      throw error;
    }
  }

  private validateResponseFormat<T>(data: any, endpoint: string): T {
    console.log(`Validating response for ${endpoint}:`, data);

    // Basic validation to ensure response has expected structure
    if (data === null || data === undefined) {
      console.warn(`Received null/undefined response for ${endpoint}`);
      return {} as T;
    }

    // Handle admin endpoints FIRST (more specific checks should come before general ones)
    // Admin orders endpoint: /admin/orders
    if (endpoint.includes('/admin/orders')) {
      if (data.orders && Array.isArray(data.orders)) {
        console.log(`Returning wrapped admin orders for ${endpoint}, length:`, data.orders.length);
        return data as unknown as T; // Return full response including pagination
      } else if (Array.isArray(data)) {
        console.log(`Returning array directly for ${endpoint}, length:`, data.length);
        return data as unknown as T;
      }
      console.log(`Returning full response for admin orders:`, data);
      return data as unknown as T;
    }

    // Handle admin users endpoint: /admin/users
    if (endpoint.includes('/admin/users')) {
      if (data.users && Array.isArray(data.users)) {
        console.log(`Returning wrapped admin users for ${endpoint}, length:`, data.users.length);
        return data as unknown as T; // Return full response including pagination
      } else if (Array.isArray(data)) {
        console.log(`Returning array directly for ${endpoint}, length:`, data.length);
        return data as unknown as T;
      }
      return data as unknown as T;
    }

    // Handle admin fuel-stations endpoint: /admin/fuel-stations
    if (endpoint.includes('/admin/fuel-stations')) {
      if (data.stations && Array.isArray(data.stations)) {
        console.log(`Returning wrapped admin stations for ${endpoint}, length:`, data.stations.length);
        return data as unknown as T; // Return full response including pagination
      } else if (Array.isArray(data)) {
        console.log(`Returning array directly for ${endpoint}, length:`, data.length);
        return data as unknown as T;
      }
      return data as unknown as T;
    }

    // Handle admin dashboard endpoint: /admin/dashboard
    if (endpoint.includes('/admin/dashboard')) {
      console.log(`Returning admin dashboard data for ${endpoint}`);
      return data as unknown as T;
    }

    // Regular orders endpoint (non-admin)
    if (endpoint.includes('/orders')) {
      if (Array.isArray(data)) {
        console.log(`Returning array directly for ${endpoint}, length:`, data.length);
        return data as unknown as T;
      } else if (data.orders && Array.isArray(data.orders)) {
        // Handle wrapped responses like { orders: [...] }
        console.log(`Returning wrapped orders for ${endpoint}, length:`, data.orders.length);
        return data.orders as unknown as T;
      } else {
        console.error(`Orders endpoint returned unexpected format for ${endpoint}:`, data);
        console.error(`Data keys:`, Object.keys(data));
        // Return the full data object if it has other properties (e.g., pagination)
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          console.log('Returning full data object');
          return data as unknown as T;
        }
        return [] as unknown as T;
      }
    }

    // Handle admin login endpoint specifically
    if (endpoint.includes('/admin/login')) {
      console.log(`Admin login response for ${endpoint}:`, data);
      if (data && data.token) {
        console.log(`Admin login successful, token present`);
        return data as unknown as T;
      } else {
        console.warn(`Admin login response missing token:`, data);
        return data as unknown as T;
      }
    }

    if (endpoint.includes('/auth')) {
      // Validate authentication response structure
      if (typeof data === 'object') {
        return data as unknown as T;
      } else {
        console.warn(`Auth endpoint returned unexpected format:`, data);
        return {} as unknown as T;
      }
    }

    // For other endpoints, return the data as-is
    return data as unknown as T;
  }

  private getMockData(endpoint: string) {
    // Return mock data based on the endpoint
    if (endpoint.includes('/orders')) {
      return [
        {
          id: 'mock-order-1',
          fuel_type: 'petrol',
          quantity: 20,
          total_price: 1800,
          status: 'delivered',
          created_at: new Date().toISOString(),
          delivery_address: '123 Main Street, City',
          fuel_stations: { name: 'Shell Petrol Station' }
        },
        {
          id: 'mock-order-2',
          fuel_type: 'diesel',
          quantity: 15,
          total_price: 1200,
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          delivery_address: '456 Oak Avenue, City',
          fuel_stations: { name: 'BP Diesel Station' }
        }
      ];
    } else if (endpoint.includes('/auth/profile') || endpoint.includes('/auth/me')) {
      return {
        user_id: 'mock-user-123',
        id: 'mock-user-123',
        email: 'user@example.com',
        full_name: 'Mock User',
        phone: '+91-9145470140',
        address: '123 Sample Address, City',
        role: 'user'
      };
    } else if (endpoint.includes('/loyalty/points')) {
      return { totalPoints: 150, tier: 'silver' };
    } else if (endpoint.includes('/auth/login')) {
      return {
        user: {
          user_id: 'mock-user-123',
          id: 'mock-user-123',
          email: 'user@example.com',
          full_name: 'Mock User',
          phone: '+91-9145470140',
          address: '123 Sample Address, City',
          role: 'user'
        },
        token: 'mock-jwt-token-for-development'
      };
    } else if (endpoint.includes('/auth/register')) {
      return {
        user: {
          user_id: 'mock-user-123',
          id: 'mock-user-123',
          email: 'user@example.com',
          full_name: 'Mock User',
          phone: '+91-9145470140',
          address: '123 Sample Address, City',
          role: 'user'
        },
        token: 'mock-jwt-token-for-development'
      };
    } else if (endpoint.includes('/auth/me')) {
      return {
        user_id: 'mock-user-123',
        id: 'mock-user-123',
        email: 'user@example.com',
        full_name: 'Mock User',
        phone: '+91-9145470140',
        address: '123 Sample Address, City',
        role: 'user'
      };
    } else if (endpoint.includes('/fuel-stations')) {
      return [
        {
          id: 'station-1',
          name: 'Shell Petrol Pump',
          address: '123 Main St, City',
          latitude: 12.3456,
          longitude: 78.9012,
          fuel_types: ['petrol', 'diesel'],
          rating: 4.5,
          distance: 1.2
        },
        {
          id: 'station-2',
          name: 'Indian Oil',
          address: '456 Market Rd, City',
          latitude: 12.3567,
          longitude: 78.9123,
          fuel_types: ['petrol', 'diesel', 'cng'],
          rating: 4.2,
          distance: 2.5
        }
      ];
    }
    // Return a general default object if no specific endpoint matched
    return {};
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    address: string;
  }) {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(userData: {
    full_name?: string;
    phone?: string;
    address?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Order endpoints
  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Create order - accepts both frontend and backend formats
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Admin-specific order status update - uses admin routes
  async updateAdminOrderStatus(id: string, status: string) {
    const adminToken = localStorage.getItem('fuel_buddy_admin_token');
    if (!adminToken) {
      throw new Error('No admin token found');
    }
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  }

  // Admin-specific payment status update
  async updateAdminPaymentStatus(id: string, paymentStatus: string) {
    const adminToken = localStorage.getItem('fuel_buddy_admin_token');
    if (!adminToken) {
      throw new Error('No admin token found');
    }
    return this.request(`/admin/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus }),
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  }

  // Fuel station endpoints
  async getFuelStations(params?: { lat?: number; lng?: number; radius?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.lat) searchParams.append('lat', params.lat.toString());
    if (params?.lng) searchParams.append('lng', params.lng.toString());
    if (params?.radius) searchParams.append('radius', params.radius.toString());

    const queryString = searchParams.toString();
    return this.request(`/fuel-stations${queryString ? `?${queryString}` : ''}`);
  }

  async getFuelStation(id: string) {
    return this.request(`/fuel-stations/${id}`);
  }

  // Loyalty endpoints
  async getLoyaltyPoints(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/loyalty/points${params}`);
  }

  async getLoyaltyTransactions(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/loyalty/transactions${params}`);
  }

  async earnLoyaltyPoints(orderId: string, orderAmount: number) {
    return this.request('/loyalty/earn', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
      }),
    });
  }

  async redeemLoyaltyPoints(pointsToRedeem: number, orderId?: string) {
    return this.request('/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify({
        points_to_redeem: pointsToRedeem,
        order_id: orderId,
      }),
    });
  }
  async getCurrentUser() {
    const token = this.token;
    if (!token) {
      console.log('No token found in API client');
      return null;
    }

    console.log('Token found in API client:', token.substring(0, 20) + '...');
    try {
      const response = await this.request<any>('/auth/me');
      console.log('Auth/me response:', response);
      return response && Object.keys(response).length > 0 ? response : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get(endpoint: string, params?: any) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request(url);
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Admin-specific endpoints
  // These methods use the admin token from localStorage
  async getAdminOrders() {
    // Always get admin token for admin requests
    const adminToken = localStorage.getItem('fuel_buddy_admin_token');
    if (!adminToken) {
      console.error('No admin token found - cannot fetch admin orders');
      return { orders: [], pagination: { total: 0 } };
    }

    return this.request('/admin/orders', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  }

  async getAdminUsers() {
    // Always get admin token for admin requests
    const adminToken = localStorage.getItem('fuel_buddy_admin_token');
    if (!adminToken) {
      console.error('No admin token found - cannot fetch admin users');
      return { users: [], pagination: { total: 0 } };
    }

    return this.request('/admin/users', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  }

  async getAdminDashboard() {
    // Always get admin token for admin requests
    const adminToken = localStorage.getItem('fuel_buddy_admin_token');
    if (!adminToken) {
      console.error('No admin token found - cannot fetch admin dashboard');
      return { dashboard: null };
    }

    return this.request('/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  }

  async getAdminFuelStations() {
    // Always get admin token for admin requests
    const adminToken = localStorage.getItem('fuel_buddy_admin_token');
    if (!adminToken) {
      console.error('No admin token found - cannot fetch admin fuel stations');
      return { stations: [], pagination: { total: 0 } };
    }

    return this.request('/admin/fuel-stations', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
  }

  async adminLogin(credentials: { username: string; password: string }) {
    // Admin login should not include any existing token
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
