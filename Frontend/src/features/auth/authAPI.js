// authSlice.js or authThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await axios.post('https://grackle-capital-glider.ngrok-free.app/login', {
        username,
        password,
      });

      // ✅ Check status
      if (response.data.status === true) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue(response.data.message || "Login failed");
      }

    } catch (error) {
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);
