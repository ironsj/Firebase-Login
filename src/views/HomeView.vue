<template>
  <div class="home">
    <h2>World Time Zones</h2>
    <p>{{userInfo}}</p>
    <img :src="userPhotoURL" v-if="userPhotoURL.length > 0" width="64">
    <button @click="outtahere">Logout</button>
    <button @click="deleteUser">Delete Profile</button>
    <Time />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Time from "./../components/70-world-time.vue"
import {
  getAuth,
  onAuthStateChanged,
  User,
  Auth,
  signOut,
  deleteUser,
} from "firebase/auth";
@Component({components: { Time }})
export default class HomeView extends Vue {
  userPhotoURL = "";
  auth: Auth | null = null;
  userInfo = "";
  user: User | null = null;
  mounted(): void {
    this.auth = getAuth();
    this.user = this.auth.currentUser
    onAuthStateChanged(this.auth, (user: User | null) => {
      console.log(user?.photoURL);
      this.userPhotoURL = user?.photoURL ?? "";
      console.log("Auth changed", user);
      if (user) {
        this.userPhotoURL = user.photoURL ?? "";
        this.userInfo = `${user.displayName}`;
      }
    });
  }

  outtahere(): void {
    if (this.auth) signOut(this.auth);

    // Back to the previous page
    this.$router.back();
  }

  deleteUser(): void {
    if(this.auth) deleteUser(this.user!).then(() =>
      console.log("Deleted")
    );

    this.$router.back();
  }
}
</script>
