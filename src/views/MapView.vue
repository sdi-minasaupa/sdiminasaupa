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
      id="map"
      class="w-full h-[400px] rounded-2xl bg-gray-200 flex items-center justify-center"
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

const route = useRoute();
const toast = inject("toast");

const data = ref({});
const loadingMap = ref(true);

let map;
let marker;

// 🔧 LOAD GOOGLE MAPS (AMAN)
function waitGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  });
}

onMounted(async () => {
  try {
    const res = await getLocation(route.query.id);

    if (!res.data.found) {
      toast("Data tidak ditemukan", "error");
      return;
    }

    data.value = res.data.data;

    // tunggu DOM & Google Maps siap
    await nextTick();
    await waitGoogleMaps();

    initMap();

  } catch (err) {
    console.error(err);
    toast("Gagal ambil lokasi", "error");
  }
});

// 🔧 INIT MAP
function initMap() {
  const lat = parseFloat(data.value.lat);
  const lng = parseFloat(data.value.lng);

  if (!lat || !lng) {
    toast("Koordinat tidak valid", "error");
    return;
  }

  const position = { lat, lng };

  map = new google.maps.Map(document.getElementById("map"), {
    center: position,
    zoom: 15
  });

  marker = new google.maps.Marker({
    position,
    map,
    title: data.value.nama
  });

  loadingMap.value = false;
}

// FORMAT TANGGAL
function formatDate(date) {
  return new Date(date).toLocaleString();
}
</script>