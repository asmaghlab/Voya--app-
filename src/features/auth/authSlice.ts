import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../utils/api';

/* ================= Types ================= */

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  role: 'user' | 'admin';
  image?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  resetEmail: string | null;
  resetCode: string | null;
}

/* ================= Initial State ================= */

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  resetEmail: null,
  resetCode: null,
};

/* ================= Load Auth From Storage ================= */

export const loadAuthFromStorage = createAsyncThunk(
  'auth/loadAuthFromStorage',
  async () => {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');

    if (token && user) {
      return {
        token,
        user: JSON.parse(user) as User,
      };
    }

    return { token: null, user: null };
  }
);

/* ================= Login ================= */

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await authApi.get<User[]>(`/users?email=${email}`);
    if (!res.data.length) return rejectWithValue('User not found');

    const user = res.data[0];
    if (user.password !== password) return rejectWithValue('Wrong password');

    return { user, token: 'fake-jwt-token' };
  } catch {
    return rejectWithValue('Login failed');
  }
});

/* ================= Register ================= */

export const registerUser = createAsyncThunk<
  { user: User; token: string },
  { name: string; email: string; password: string; phone: string; country: string },
  { rejectValue: string }
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const usersRes = await authApi.get<User[]>('/users');
    if (usersRes.data.find(u => u.email === userData.email)) {
      return rejectWithValue('Email already registered');
    }

    const res = await authApi.post<User>('/users', {
      ...userData,
      role: 'user',
    });

    return { user: res.data, token: 'fake-jwt-token' };
  } catch {
    return rejectWithValue('Registration failed');
  }
});

/* ================= Update Profile ================= */

export const updateUserProfile = createAsyncThunk<
  User,
  { id: number; name: string; email: string; phone: string; country: string },
  { rejectValue: string }
>('auth/updateUserProfile', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const res = await authApi.put<User>(`/users/${id}`, data);
    return res.data;
  } catch {
    return rejectWithValue('Failed to update profile');
  }
});

/* ================= Send Reset Code ================= */

export const sendResetCode = createAsyncThunk<
  { email: string; code: string },
  { email: string },
  { rejectValue: string }
>('auth/sendResetCode', async ({ email }, { rejectWithValue }) => {
  try {
    const res = await authApi.get<User[]>(`/users?email=${email}`);
    if (!res.data.length) return rejectWithValue('Email not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Reset code:', code);

    return { email, code };
  } catch {
    return rejectWithValue('Failed to send reset code');
  }
});

/* ================= Reset Password ================= */

export const resetPassword = createAsyncThunk<
  User,
  { code: string; newPassword: string },
  { rejectValue: string; state: { auth: AuthState } }
>('auth/resetPassword', async ({ code, newPassword }, { rejectWithValue, getState }) => {
  try {
    const { resetEmail, resetCode } = getState().auth;

    if (!resetEmail) return rejectWithValue('Session expired');
    if (code !== resetCode) return rejectWithValue('Invalid code');

    const res = await authApi.get<User[]>(`/users?email=${resetEmail}`);
    if (!res.data.length) return rejectWithValue('User not found');

    const user = res.data[0];
    const updatedUser = await authApi.put<User>(`/users/${user.id}`, {
      ...user,
      password: newPassword,
    });

    return updatedUser.data;
  } catch {
    return rejectWithValue('Failed to reset password');
  }
});

/* ================= Slice ================= */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.resetEmail = null;
      state.resetCode = null;
      state.error = null;

      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },

    updateUserLocally(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        AsyncStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    clearError(state) {
      state.error = null;
    },

    clearResetData(state) {
      state.resetEmail = null;
      state.resetCode = null;
      state.error = null;
    },
  },

  extraReducers: builder => {
    builder
      /* Load From Storage */
      .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      /* Login */
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        AsyncStorage.setItem('token', action.payload.token);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      })

      /* Register */
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;

        AsyncStorage.setItem('token', action.payload.token);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Registration failed';
      })

      /* Update Profile */
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        AsyncStorage.setItem('user', JSON.stringify(action.payload));
      })

      /* Send Reset Code */
      .addCase(sendResetCode.fulfilled, (state, action) => {
        state.resetEmail = action.payload.email;
        state.resetCode = action.payload.code;
      })

      /* Reset Password */
      .addCase(resetPassword.fulfilled, state => {
        state.resetEmail = null;
        state.resetCode = null;
      });
  },
});

export const {
  logout,
  updateUserLocally,
  clearError,
  clearResetData,
} = authSlice.actions;

export default authSlice.reducer;
