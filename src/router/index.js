import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Map from "../views/Map.vue";
import MapView from "../views/MapView.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login/:id/:nama", component: Login },
  { path: "/map", component: Map },
  { path: "/map-view", component: MapView}
];

export default createRouter({
  history: createWebHistory(),
  routes
});