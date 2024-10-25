const axios = require('axios');

class ShiprocketService {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.token = null;
  }

  async login() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      });
      this.token = response.data.token;
      return response.data;
    } catch (error) {
      console.error('Shiprocket login failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async createOrder(orderData) {
    if (!this.token) {
      await this.login();
    }
    try {
      const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, orderData, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      console.log("++++++++++++++++++++++++++++++++++++++++++++++",response.data,"+++++++++++++++++++++++++++++++++");
      return response.data;
    } catch (error) {
      console.error('Shiprocket create order failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async trackShipment(shipmentId) {
    if (!this.token) await this.login();
    try {
      const response = await axios.get(`${this.baseURL}/courier/track/shipment/${shipmentId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Shiprocket track shipment error:', error);
      throw error;
    }
  }
}

module.exports = new ShiprocketService();
