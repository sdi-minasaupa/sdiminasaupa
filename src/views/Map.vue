<template>
  <div class="relative">
    <!-- Header -->
    <div class="mb-2">
      <h2 class="font-bold">{{ user?.nama }}</h2>
      <p class="text-sm text-gray-500">Tentukan lokasi rumah (OSM)</p>
    </div>

    <!-- MAP -->
    <div ref="mapEl" class="h-[500px] w-full rounded-2xl"></div>

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
import { useRouter } from "vue-router";
import { saveLocation } from "../api/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const toast = inject("toast");
const router = useRouter();

// 🔒 SESSION
const user = JSON.parse(sessionStorage.getItem("user"));

// STATE
const showModal = ref(false);
const loading = ref(false);

const lat = ref(null);
const lng = ref(null);

const mapEl = ref(null);

let map;
let marker;

// 🔧 FIX ICON
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ======================
// INIT MAP
// ======================
onMounted(async () => {
  if (!user) {
    router.push("/");
    return;
  }

  await nextTick();

  if (!mapEl.value) {
    console.error("Map element tidak ada");
    return;
  }

  map = L.map(mapEl.value).setView([-5.1477, 119.4327], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  map.on("click", (e) => {
    setMarker(e.latlng.lat, e.latlng.lng);
  });
});

// ======================
// SET MARKER
// ======================
function setMarker(la, ln) {
  lat.value = la;
  lng.value = ln;

  if (marker) map.removeLayer(marker);

  marker = L.marker([la, ln]).addTo(map);
  map.setView([la, ln], 15);
}

// ======================
// GPS
// ======================
function getLocation() {
  if (!navigator.geolocation) {
    toast("GPS tidak didukung", "error");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setMarker(pos.coords.latitude, pos.coords.longitude);
      toast("Lokasi ditemukan", "success");
    },
    () => {
      toast("Izinkan akses lokasi", "error");
    },
  );
}

// ======================
// MODAL
// ======================
function openModal() {
  if (lat.value === null || lng.value === null) {
    toast("Pilih lokasi dulu", "warning");
    return;
  }

  showModal.value = true;
}

// ======================
// SUBMIT
// ======================
async function confirmSubmit() {
  if (!user || !user.id || !user.nisn) {
    toast("Session tidak valid", "error");
    router.replace("/");
    return;
  }

  if (lat.value === null || lng.value === null) {
    toast("Pilih lokasi dulu", "warning");
    return;
  }

  loading.value = true;

  try {
    const res = await saveLocation({
      id: user.id,
      nama: user.nama,
      nisn: user.nisn,
      lat: lat.value,
      lng: lng.value,
    });

    console.log("RESPONSE:", res.data); // debug

    // 🔥 pastikan benar-benar sukses
    if (res?.data?.success) {
      toast("Lokasi berhasil disimpan", "success");

      sessionStorage.removeItem("user");

      showModal.value = false;

      setTimeout(() => {
        router.replace("/");
      }, 800);
    } else {
      toast(res?.data?.message || "Gagal menyimpan", "error");
    }
  } catch (err) {
    console.error(err);
    toast("Gagal koneksi server", "error");
  }

  loading.value = false;
}
</script>
