<template>
  <div class="p-4">

    <h2 class="text-xl font-bold mb-1">
      {{ data.nama || 'Loading...' }}
    </h2>

    <p class="text-sm text-gray-500 mb-3">
      Lokasi yang telah disimpan
    </p>

    <!-- MAP -->
    <div
      ref="mapEl"
      class="w-full h-[500px] rounded-2xl bg-gray-200 flex items-center justify-center"
    >
      <span v-if="loadingMap" class="text-gray-500">
        Memuat peta...
      </span>
    </div>

    <!-- INFO -->
    <div v-if="data.lat" class="mt-3 text-sm text-gray-600">
      <p>Latitude: {{ data.lat }}</p>
      <p>Longitude: {{ data.lng }}</p>
      <p>Waktu: {{ formatDate(data.waktu) }}</p>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, inject, nextTick } from "vue";
import { useRoute } from "vue-router";
import { getLocation } from "../api/api";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const route = useRoute();
const toast = inject("toast");

const data = ref({});
const loadingMap = ref(true);

const mapEl = ref(null);

let map;
let marker;

// 🔧 FIX ICON (WAJIB BIAR MARKER MUNCUL)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================
// INIT
// =====================
onMounted(async () => {
  try {
    const res = await getLocation(route.query.id);

    if (!res.data.found) {
      toast("Data tidak ditemukan", "error");
      return;
    }

    data.value = res.data.data;

    await nextTick();
    initMap();

  } catch (err) {
    console.error(err);
    toast("Gagal ambil lokasi", "error");
  }
});

// =====================
// INIT MAP (LEAFLET)
// =====================
function initMap() {
  const lat = parseFloat(data.value.lat);
  const lng = parseFloat(data.value.lng);

  // validasi koordinat
  if (isNaN(lat) || isNaN(lng)) {
    toast("Koordinat tidak valid", "error");
    return;
  }

  map = L.map(mapEl.value).setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${data.value.nama}</b><br>Lokasi rumah`)
    .openPopup();

  loadingMap.value = false;
}

// =====================
// FORMAT TANGGAL
// =====================
function formatDate(date) {
  return new Date(date).toLocaleString();
}
</script>

<style>
/* Fix layering kalau ada konflik */
.leaflet-container {
  z-index: 0;
}
</style>