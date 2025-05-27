const BASE_URL = 'https://68333d9b464b499636fecb2e.mockapi.io/api/v1';

export const api = {
  // Auth endpoints
  register: async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '***' });
      
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Registration response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      console.log('Login attempt with email:', email);
      
      // First, validate the input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Make the API request
      console.log('Fetching users from:', `${BASE_URL}/users`);
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Server response not OK:', response.status);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const users = await response.json();
      console.log('Fetched users count:', users.length);
      
      // Find the user with matching email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      console.log('Found user:', user ? 'Yes' : 'No');
      
      if (!user) {
        throw new Error('No account found with this email');
      }
      
      // In a real app, we would compare hashed passwords
      // For now, we'll do a simple comparison
      const passwordMatch = user.password === password;
      console.log('Password match:', passwordMatch);
      
      if (!passwordMatch) {
        throw new Error('Invalid password');
      }
      
      // Remove sensitive data before returning
      const { password: _, ...userWithoutPassword } = user;
      console.log('Login successful for user:', userWithoutPassword.email);
      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Parking lots endpoints
  getParkingLots: async () => {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get parking lots error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  getParkingLotById: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get parking lot by ID error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  createParkingLot: async (parkingLotData) => {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(parkingLotData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create parking lot error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  updateParkingLot: async (id, parkingLotData) => {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(parkingLotData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update parking lot error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  deleteParkingLot: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete parking lot error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  getParkingLotsByLocation: async (location) => {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots?location=${encodeURIComponent(location)}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get parking lots by location error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Bookings endpoints
  createBooking: async (bookingData) => {
    try {
      // Get the current user
      const userResponse = await fetch(`${BASE_URL}/users/${bookingData.userId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user: ${userResponse.status}`);
      }

      const user = await userResponse.json();
      
      // Create the new booking
      const newBooking = {
        id: Date.now().toString(), // Generate a unique ID
        parking_lot_id: bookingData.parkingLotId,
        parking_lot_name: bookingData.parkingLotName,
        license_plate: bookingData.licensePlate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        fee: bookingData.fee,
        status: bookingData.status,
        space_number: bookingData.spaceNumber,
        created_at: new Date().toISOString()
      };

      // Add the booking to the user's bookings array
      const updatedUser = {
        ...user,
        bookings: [...(user.bookings || []), newBooking]
      };

      // Update the user with the new booking
      const response = await fetch(`${BASE_URL}/users/${bookingData.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create booking error details:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return newBooking;
    } catch (error) {
      console.error('Create booking error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },

  getUserBookings: async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const user = await response.json();
      return user.bookings || [];
    } catch (error) {
      console.error('Get user bookings error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      return [];
    }
  },

  updateUser: async (userId, userData) => {
    try {
      console.log('Updating user with data:', userData);
      
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update user error details:', errorData);
        throw new Error(`Failed to update user: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('User updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  updateBooking: async (bookingId, bookingData) => {
    try {
      // Convert camelCase to snake_case for the API
      const formattedData = {
        end_time: bookingData.end_time,
        fee: bookingData.fee,
        status: bookingData.status
      };

      console.log('Updating booking with data:', formattedData);

      const response = await fetch(`${BASE_URL}/users/${bookingData.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          bookings: [{
            id: bookingId,
            ...formattedData
          }]
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update booking error details:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update booking error:', error);
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  },
}; 