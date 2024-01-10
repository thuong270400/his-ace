<template>
  <v-card>
    <v-card-title>Send SMS</v-card-title>
    <v-card-text>
      <v-btn @click="sendSMS()">Click to send sms</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
// import firebase from "firebase/app";
// import "firebase/messaging";
// Firebase v9
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
export default {
  data() {
    return {};
  },
  methods: {
    async sendSMS() {
    //   const token = "FIREBASE_DEVICE_TOKEN";
      const message = "YOUR_FCM_MESSAGE";

      const firebaseConfig = {
        apiKey: "AIzaSyAl8t6hWMkUmYS-tW-CeimReeqxdVdYVso",
        authDomain: "tfbvn-3755f.firebaseapp.com",
        projectId: "tfbvn-3755f",
        storageBucket: "tfbvn-3755f.appspot.com",
        messagingSenderId: "182751926310",
        appId: "1:182751926310:web:c8a21b16021910f4ddaee7",
        // measurementId: "G-6SHCHXWGBB"
      };
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      console.log(messaging);
      await messaging.firebaseDependencies.installations
        .getToken()
        .then(async (token) => {
          // Gửi token này lên server của bạn để lưu trữ
          console.log("token", token);
          if (token) {
            try {
              const response = await axios.post(
                `${useRuntimeConfig().public.DOMAIN}/send-fcm`,
                {
                  token,
                  message,
                }
              );
              console.log(response.data);
            } catch (error) {
              console.error("Error sending FCM:", error);
            }
          }
        })
        .catch((error) => {
          console.error("Error getting FCM token:", error);
        });
    },
  },
};
</script>

<style>
</style>