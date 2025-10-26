// Replace with your actual backend URL after deployment
const API_BASE_URL = 'https://isp-billing-crm.onrender.com/api';

const API = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await response.json();
  },

  getClients: async () => {
    const token = localStorage.getItem('isp_token');
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  },

  saveClient: async (client) => {
    const token = localStorage.getItem('isp_token');
    const url = client.id ? `${API_BASE_URL}/clients/${client.id}` : `${API_BASE_URL}/clients`;
    const method = client.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(client)
    });
    return await response.json();
  },

  deleteClient: async (id) => {
    const token = localStorage.getItem('isp_token');
    await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getBilling: async () => {
    const token = localStorage.getItem('isp_token');
    const response = await fetch(`${API_BASE_URL}/billing`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  },

  saveBilling: async (bill) => {
    const token = localStorage.getItem('isp_token');
    const url = bill.id ? `${API_BASE_URL}/billing/${bill.id}` : `${API_BASE_URL}/billing`;
    const method = bill.id ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(bill)
    });
    return await response.json();
  },

  mikrotik: {
    connect: async (config) => {
      const token = localStorage.getItem('isp_token');
      const response = await fetch(`${API_BASE_URL}/mikrotik/test-connection`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      return await response.json();
    },
    getUsers: async () => {
      const token = localStorage.getItem('isp_token');
      const response = await fetch(`${API_BASE_URL}/mikrotik/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    },
    createUser: async (userData) => {
      const token = localStorage.getItem('isp_token');
      const response = await fetch(`${API_BASE_URL}/mikrotik/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    },
    updateUser: async (username, data) => {
      const token = localStorage.getItem('isp_token');
      const response = await fetch(`${API_BASE_URL}/mikrotik/users/${username}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    deleteUser: async (username) => {
      const token = localStorage.getItem('isp_token');
      const response = await fetch(`${API_BASE_URL}/mikrotik/users/${username}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    }
  }
};

export default API;
