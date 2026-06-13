import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./reducers/dashboardReducer";
import testingReducer from "./reducers/testingReducer";
import btcReducer from "./reducers/btcReducer";
import strategiesReducer from "./reducers/strategiesReducer";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    testing: testingReducer,
    btc: btcReducer,
    strategies: strategiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
