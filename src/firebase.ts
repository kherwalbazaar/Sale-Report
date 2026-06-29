import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCCL6SPcr1FusH4ki3Qybp4qk3eg3-t6Ps",
  authDomain: "sell-report.firebaseapp.com",
  databaseURL: "https://sell-report-default-rtdb.firebaseio.com",
  projectId: "sell-report",
  storageBucket: "sell-report.firebasestorage.app",
  messagingSenderId: "641520958494",
  appId: "1:641520958494:web:fcc5fefe1d6aaef85d820f",
  measurementId: "G-WPQ6M669WD",
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const database = typeof window !== "undefined" ? getDatabase(app) : null;

export { app, analytics, database };
