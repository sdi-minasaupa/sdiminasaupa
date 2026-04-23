<template>
  <div class="relative">
    <!-- Header -->
    <div class="mb-2">
      <h2 class="font-bold">{{ route.query.nama }}</h2>
      <p class="text-sm text-gray-500">Tentukan lokasi rumah</p>
    </div>

    <!-- MAP -->
    <div id="map" class="h-[400px] rounded-2xl"></div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
        <h2 class="text-lg font-bold mb-2">Konfirmasi Simpan</h2>

        <p class="text-sm text-gray-600 mb-4">
          Apakah kamu yakin ingin menyimpan lokasi ini?
        </p>

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
            class="btn btn-success flex items-center justify-center gap-2"
            :class="loading ? 'opacity-70 cursor-not-allowed' : ''"
          >
            <!-- Spinner -->
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>

            <span>
              {{ loading ? "Menyimpan..." : "Ya, Simpan" }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- FLOATING BUTTONS -->
    <div class="absolute bottom-4 left-4 flex flex-col gap-2">
      <button @click="getLocation" class="btn btn-secondary shadow">
        📍 Lokasi Saya
      </button>

      <button @click="openModal" class="btn btn-success shadow">
        ✔ Simpan Lokasi
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, inject } from "vue";
import { useRoute } from "vue-router";
import { saveLocation } from "../api/api";

const toast = inject("toast");
const route = useRoute();
const showModal = ref(false);
const loading = ref(false);

let map;
let marker;

const lat = ref(null);
const lng = ref(null);

onMounted(() => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -5.1477, lng: 119.4327 },
    zoom: 13,
  });

  map.addListener("click", (e) => {
    setMarker(e.latLng.lat(), e.latLng.lng());
  });
});

function setMarker(la, ln) {
  lat.value = la;
  lng.value = ln;

  if (marker) marker.setMap(null);

  marker = new google.maps.Marker({
    position: { lat: la, lng: ln },
    map,
  });
}

function getLocation() {
  navigator.geolocation.getCurrentPosition((pos) => {
    setMarker(pos.coords.latitude, pos.coords.longitude);
    toast("Lokasi berhasil dideteksi", "success");
  });
}

async function submit() {
  if (!lat.value) {
    toast("Pilih lokasi dulu", "error");
    return;
  }

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
      }, 1200);
    } else {
      toast(res.data.message, "error");
    }
  } catch (err) {
    toast("Gagal koneksi server", "error");
  } finally {
    loading.value = false;
  }
}

function openModal() {
  if (!lat.value || !lng.value) {
    toast("Pilih lokasi dulu", "warning");
    return;
  }

  showModal.value = true;
}

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
        showModal.value = false;
        location.href = "/";
      }, 800);
    } else {
      toast(res.data.message, "error");
    }
  } catch (err) {
    toast("Gagal koneksi server", "error");
  } finally {
    loading.value = false;
  }
}
</script>
