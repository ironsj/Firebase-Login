<template>
  <div id="face" v-bind:class="isPM ? 'PM' : 'AM'">
    <div>{{time}}</div>
    <div>{{date}}</div>
    <h3 class="truncate">{{label}}</h3>
    <button class="delete" @click="$emit('delete')">X</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ZonedDateTime, ZoneId, DateTimeFormatter } from "@js-joda/core";
import "@js-joda/timezone";
import "@js-joda/locale_en-us";
import { Locale } from "@js-joda/locale_en-us";
const timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

// To show the month name, the Locale must be set
const dateFormatter = DateTimeFormatter.ofPattern("MMM d").withLocale(
  Locale.US
);
@Component
export default class WorldClock extends Vue {
  @Prop() timeZone!: string;
  @Prop() label!: string;

  zdt: ZonedDateTime | null = ZonedDateTime.now();
  timer: number | null = null;
  isPM = false;
  test = 0;

  
  get time(): string {
    return this.zdt?.format(timeFormatter) ?? "00:00";
  }

  get date(): string {
    // console.log("Local date", this.zdt?.format(dateFormatter));
    return this.zdt?.toLocalDate().format(dateFormatter) ?? "what";
  }

  mounted(): void {
    this.zdt = ZonedDateTime.now(ZoneId.of(this.timeZone));
    this.timer = setInterval(() => {
      this.zdt = ZonedDateTime.now(ZoneId.of(this.timeZone));
      if(this.zdt.hour() >= 12){
        this.isPM = true;
      }
      else{
        this.isPM = false;
      }
    }, 1000);
    // console.log("here", this.timeZone, zdt.toString());
  }

  beforeDestroy(): void {
    if (this.timer) {
      console.log("Delete timer");
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
</script>

<style scoped>
#face {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  border-radius: 0.5em;
  padding: 0.5em;
  margin: 4px;
  width: 6em;
}
#face:hover {
  transform: scale(1.05);
}
#face div:first-child {
  font-size: 200%;
}
.truncate {
  max-width: 5em;
  white-space: nowrap; /* disable text wrap */
  overflow: hidden;
  text-overflow: ellipsis;
}
.delete {
  line-height: 12px;
  width: 18px;
  font-weight: bolder;
  font-size: 8pt;
  font-family: tahoma;
  margin-top: 1px;
  margin-right: 1px;
  position:absolute;
  top:0;
  right:0;
 }
 .PM{
  border: 3px solid black;
  background-color: rgb(9, 9, 53);
  color: whitesmoke;
 }
 .AM{
  border: 3px solid rgb(236, 236, 48);
  background-color: rgb(243, 242, 242);
  color: navy;
 }
</style>