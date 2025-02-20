/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
// authSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from '../store';
import axios from 'axios';

// Define the LoginData type
interface LoginData {
  userName: string;
  userId: string;
}

interface AuthState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginData: LoginData | null; // Include loginData in the state
}

const initialState: AuthState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  loginData: null, // Initialize loginData as null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginData>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.loginData = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Define the OTP type
// interface OTPData {
//     email: string;
//     userId: string;
// }

// interface AuthState {
//     loading: boolean;
//     error: string | null;
//     isAuthenticated: boolean;
//     loginData: LoginData | null; // Include loginData in the state
// }

// const initialState: AuthState = {
//     loading: false,
//     error: null,
//     isAuthenticated: false,
//     loginData: null, // Initialize loginData as null
// };

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         loginStart: (state) => {
//             state.loading = true;
//             state.error = null;
//         },
//         loginSuccess: (state, action: PayloadAction<LoginData>) => {
//             state.loading = false;
//             state.isAuthenticated = true;
//             state.loginData = action.payload;
//         },
//         loginFailure: (state, action: PayloadAction<string>) => {
//             state.loading = false;
//             state.error = action.payload;
//         },
//     },
// });

import { SERVER_URL_ROASTERING, SERVER_URL} from '../Constant';

export const {loginStart, loginSuccess, loginFailure} = authSlice.actions;

export default authSlice.reducer;

export const login =
  (email: string, isEmail: boolean, isSMS: boolean): AppThunk<Promise<any>> =>
  async dispatch => {
    dispatch(loginStart());

    try {
      const apiUrl = `${SERVER_URL_ROASTERING}/login/mobile/new`;
      console.log(apiUrl);

      const payload = {
        mobileNumber: email,
        sendEmail: isEmail,
        sendTextMessage: isSMS
      };
      console.log(payload);

      const response = await axios.post(apiUrl, payload);

      dispatch(loginSuccess(response.data));
      return response.data;
    } catch (error) {
        console.log(error);

      dispatch(loginFailure('Login Failed!'));
      throw error;
    }

    // const apiUrl = `${SERVER_URL}/login/mobile`;
    // console.log('API URL:', apiUrl);
    
    // const payload = {
    //   email: email,
    // };
    // console.log('PAYLOAD:', payload);
    
    // let response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     // 'ACCESS-CONTROL-ALLOW-ORIGIN': '*',
    //   },
    //   body: JSON.stringify(payload),
    // })
    //   .then(response => response.json())
    //   .then(responseData => {
    //     console.log('RESULTS HERE:', responseData);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  };

export const VerifyOTP =
  (email: string, otp: number): AppThunk<Promise<any>> =>
  async dispatch => {
    dispatch(loginStart());

    try {
      const apiUrl = `${SERVER_URL_ROASTERING}/verify/otp/login`;
      const payload = {
        email: email,
        otp: otp,
      };

      const response = await axios.post(apiUrl, payload);

      dispatch(loginSuccess(response.data));
      return response.data;
    } catch (error) {
      dispatch(loginFailure('Login Failed!'));
      throw error;
    }
  };
