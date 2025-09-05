// src/features/auth/authThunk.js
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

      if (response.data.status === true) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue(response.data.message || "Invalid login");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue("Server error");
    }
  }
);
