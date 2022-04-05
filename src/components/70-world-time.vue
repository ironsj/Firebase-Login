<template>
  <div>
    <div>
      <WorldMap @map-clicked="what" />
    </div>
    <input type="text" :value="geoPosition">
    <button @click="searchCity">Add</button>
    <div id="clocks">
      <Clock @delete="deleteClock(pos)" v-for="(c,pos) in selectedCities" :key="pos"
        :time-zone="c.timeZone" :label="c.name">
      </Clock>
    </div>
    <button @click="saveTimes">Save Locations</button>
  </div>
</template>

<script lang="ts">
// import ChildComponent from "./60-props-child.vue";
import axios, { AxiosResponse } from "axios";
import Clock from "./70-clock.vue";
import WorldMap from "./70-world-map.vue";
import { Vue, Component } from "vue-property-decorator";
import {
  getAuth,
  onAuthStateChanged,
  User,
  Auth,
  signOut,
  deleteUser,
} from "firebase/auth";
import { 
  DocumentReference, 
  setDoc, 
  doc, 
  CollectionReference, 
  collection, 
  addDoc, 
  getDocs, 
  QuerySnapshot, 
  QueryDocumentSnapshot, 
  deleteDoc 
  } from "firebase/firestore";
import { db } from "./../main"


const timezoneDBUrl = "http://api.timezonedb.com/v2.1";
type City = {
  name: string;
  timeZone: string;
};

type TimeZoneData = {
  countryName: string;
  gmtOffset: number;
  regionName: string;
  zoneName: string;
};

@Component({ components: { Clock, WorldMap } })
export default class Time extends Vue {
  geoPos: { lat?: number; lng?: number } = {};
  selectedCities: Array<City> = [];
  apiKey = "";
  auth: Auth | null = null;
  user: User | null = null;
  
  mounted(): void {
    this.auth = getAuth();
    this.user = this.auth.currentUser;
    onAuthStateChanged(this.auth, (user: User | null) => {
      console.log("Auth changed", user);
      if (user) {
        console.log(`${user.uid}`);
        const uid = user.uid;
        this.apiKey = process.env.VUE_APP_TIMEZONE_API_KEY;
        const userCities = collection(db, "locations", uid, "cities");
        getDocs(userCities).then((myQueryRes: QuerySnapshot) => {
          myQueryRes.forEach((myDoc: QueryDocumentSnapshot) => {
            const userData = myDoc.data();
            this.selectedCities.push({name: userData.name, timeZone: userData.timeZone});
            console.log(`Fetched ${userData.name}`);
          });
        });
      }
    });
    
    
  }
  
  get geoPosition(): string {
    if (this.geoPos.lat && this.geoPos.lng)
      return `${this.geoPos.lat.toPrecision(5)},${this.geoPos.lng.toPrecision(
        5
      )}`;
    else return "N/A";
  }
  
  searchCity(): void {
    const param = new URLSearchParams();
    param.append("key", this.apiKey);
    param.append("format", "json");
    param.append("by", "position");
    param.append("lat", this.geoPos.lat!.toString());
    param.append("lng", this.geoPos.lng!.toString());
    const tzUrl = `${timezoneDBUrl}/get-time-zone?` + param.toString();
    // Use a Web Proxy Server to get around CORS issue
    // since timezonedb.com does not allow CORS
    axios
      .request({
        method: "GET",
        url: "https://api.allorigins.win/get",
        params: {
          url: tzUrl,
        },
      })
      .then((r: AxiosResponse) => {
        return r.data;
      })
      .then((r: any) => JSON.parse(r.contents))
      .then((r: TimeZoneData) => {
        // Add the selected location to our array
        const duplicateRegion = this.selectedCities.map((c:City) => c.name).some((s:string) => s === r.regionName);
        if(!duplicateRegion){
          this.selectedCities.push({ name: r.regionName, timeZone: r.zoneName });
        }else{
          console.log("Duplicate!")
        }
        
      });
  }

  saveTimes(): void{
    const uid = this.user!.uid;
    const proms = this.selectedCities.map((c:City) => {
      const cityDoc = doc(db, "locations", uid, "cities", c.name);
      return setDoc(cityDoc, {name: c.name, timeZone: c.timeZone});
    });

    Promise.all(proms).then(() => {
      console.log("Batch inserts done");
    }).catch((err:any) => { console.log("error saving") });
  }

  deleteClock(position: number): void{
    console.log(position);
    const uid = this.user!.uid;
    let removed = this.selectedCities.splice(position, 1);
    console.log("successful");
    deleteDoc(doc(db, "locations", uid, "cities", removed[0].name))
  }

  what(geoPos: { lat: number; lng: number }): void {
    // When the user pans the map left/right the longitude
    // angle can be out of the [-180,+180] range
    while (geoPos.lng > 180) geoPos.lng -= 360;
    while (geoPos.lng < -180) geoPos.lng += 360;
    this.geoPos = { ...geoPos };
  }
}
</script>

<style scoped>
#clocks {
  margin-top: 1em;
}
pre {
  white-space: normal;
  padding: 0.5em;
  border: 2px solid gray;
}
</style>