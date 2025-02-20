/* eslint-disable prettier/prettier */
// store.ts

// import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
// import authReducer from './redux/authSlice';

// const store = configureStore({
//   reducer: {
//     auth: authReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

// export default store;


// new store
import { configureStore, ThunkAction, Action, getDefaultMiddleware } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice'; // Import your authSlice
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root', // Change this key as needed
  storage: AsyncStorage,
  blacklist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

// const store = configureStore({
//   reducer: {
//     auth: persistedReducer, // Use persistedReducer with Redux Persist
//   },
// });

export const store = configureStore({
  reducer: {auth: persistedReducer},
  middleware: getDefaultMiddleware({
    serializableCheck: false, // Disable serializable check for development
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;

export const persistor = persistStore(store); // Export persistor for use in your app


// end new store


// import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import authReducer from './redux/authSlice';

// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
// };

// const persistedReducer = persistReducer(persistConfig, authReducer);

// export const store = configureStore({
//   reducer: {
//     auth: persistedReducer,
//   },
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

