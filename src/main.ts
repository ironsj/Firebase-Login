import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./myconfig";
import { Firestore, getFirestore } from "firebase/firestore";
Vue.config.productionTip = false;
const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");

export {db};
