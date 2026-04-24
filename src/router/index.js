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

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🔒 ROUTE GUARD
router.beforeEach((to) => {
  const user = sessionStorage.getItem("user");

  if (to.path === "/map" && !user) {
    return "/";
  }
});

export default router;

// export default createRouter({
//   history: createWebHistory(),
//   routes
// });