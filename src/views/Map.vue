<template>
  <div class="relative">
    <!-- Header -->
    <div class="mb-2">
      <h2 class="font-bold">{{ route.query.nama }}</h2>
      <p class="text-sm text-gray-500">Tentukan lokasi rumah (OSM)</p>
    </div>

    <!-- MAP -->
    <div ref="mapEl" class="h-[500px] rounded-2xl"></div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
        <h2 class="text-lg font-bold mb-2">Konfirmasi Simpan</h2>

        <div class="bg-gray-100 p-3 rounded-xl text-sm mb-4">
          <p>📍 Latitude: {{ lat }}</p>
          <p>📍 Longitude: {{ lng }}</p>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="showModal = false" class="btn btn-secondary">
            Batal
          </button>

          <button
            @click="confirmSubmit"
            :disabled="loading"
            class="btn btn-success flex items-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                class="opacity-25"
              />
              <path
                fill="currentColor"
                class="opacity-75"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>

            {{ loading ? "Menyimpan..." : "Ya, Simpan" }}
          </button>
        </div>
      </div>
    </div>

    <!-- FLOAT BUTTON -->
    <div
      class="absolute bottom-4 left-4 flex flex-col gap-2 z-[9999]"
      style="pointer-events: auto"
    >
      <button @click="getLocation" class="btn btn-secondary shadow">
        📍 Lokasi Saya
      </button>

      <button type="button" @click="openModal" class="btn btn-success shadow">
        ✔ Simpan Lokasi
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, inject } from "vue";
import { useRoute } from "vue-router";
import { saveLocation } from "../api/api";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const toast = inject("toast");
const route = useRoute();

const showModal = ref(false);
const loading = ref(false);

const lat = ref(null);
const lng = ref(null);

const mapEl = ref(null);

let map;
let marker;

// 🔧 FIX ICON (WAJIB)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// INIT MAP
onMounted(async () => {
  await nextTick();

  map = L.map(mapEl.value).setView([-5.1477, 119.4327], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // klik map
  map.on("click", (e) => {
    setMarker(e.latlng.lat, e.latlng.lng);
  });
});

// SET MARKER
function setMarker(la, ln) {
  lat.value = la;
  lng.value = ln;

  if (marker) map.removeLayer(marker);

  marker = L.marker([la, ln]).addTo(map);
  map.setView([la, ln], 15);
}

// GPS
function getLocation() {
  if (!navigator.geolocation) {
    toast("GPS tidak didukung", "error");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setMarker(pos.coords.latitude, pos.coords.longitude);
      toast("Lokasi berhasil dideteksi", "success");
    },
    () => {
      toast("Izinkan akses lokasi", "error");
    },
  );
}

// MODAL
function openModal() {
  console.log("CLICK SIMPAN", lat.value, lng.value);

  if (!lat.value) {
    toast("Pilih lokasi dulu", "warning");
    return;
  }

  showModal.value = true;
}

// SUBMIT
async function confirmSubmit() {
  loading.value = true;

  try {
    const res = await saveLocation({
      id: route.query.id,
      nama: route.query.nama,
      nisn: route.query.nisn,
      lat: lat.value,
      lng: lng.value,
    });

    if (res.data.success) {
      toast("Lokasi berhasil disimpan", "success");

      setTimeout(() => {
        location.href = "/";
      }, 1000);
    } else {
      toast(res.data.message, "error");
    }
  } catch {
    toast("Gagal koneksi server", "error");
  }

  loading.value = false;
}
</script>
