<template>
  <div>
    <!-- STATISTIK -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="card flex items-center gap-4">
        <div class="text-3xl">👨‍🎓</div>
        <div>
          <p class="text-sm text-gray-500">Total</p>
          <h2 class="text-xl font-bold">{{ total }}</h2>
        </div>
      </div>

      <div class="card flex items-center gap-4">
        <div class="text-3xl text-green-600">✔</div>
        <div>
          <p class="text-sm text-gray-500">Sudah</p>
          <h2 class="text-xl font-bold">{{ sudah }}</h2>
        </div>
      </div>

      <div class="card flex items-center gap-4">
        <div class="text-3xl text-red-600">⏳</div>
        <div>
          <p class="text-sm text-gray-500">Belum</p>
          <h2 class="text-xl font-bold">{{ belum }}</h2>
        </div>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card mb-4 flex flex-col md:flex-row gap-2">
      <input
        v-model="search"
        placeholder="Cari nama siswa..."
        class="border p-2 rounded-xl w-full"
      />

      <select v-model="kelas" class="border p-2 rounded-xl">
        <option value="">Semua Kelas</option>
        <option v-for="k in listKelas" :key="k">{{ k }}</option>
      </select>
    </div>

    <!-- LIST -->
    <div class="grid gap-3">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="card flex justify-between items-center hover:shadow-md transition"
      >
        <div>
          <p class="font-semibold">{{ s.nama }}</p>
          <p class="text-xs text-gray-500">{{ s.kelas }}</p>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="
              s.status === 'Sudah'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            "
          >
            {{ s.status }}
          </span>

          <div class="flex gap-2">
            <!-- JIKA BELUM -->
            <button
              v-if="s.status !== 'Sudah'"
              @click="goLogin(s)"
              class="btn btn-primary"
            >
              Verifikasi
            </button>

            <!-- JIKA SUDAH -->
            <button v-else @click="viewLocation(s)" class="btn btn-secondary">
              Lihat Lokasi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-if="loading" class="text-center text-gray-500 mt-10">
      Memuat data...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from "vue";
import { getSiswa } from "../api/api";
import { useRouter } from "vue-router";

const siswa = ref([]);
const loading = ref(false);
const toast = inject("toast");

const search = ref("");
const kelas = ref("");
const router = useRouter();

onMounted(async () => {
  loading.value = true;

  // Toast loading
  toast("Memuat data siswa...", "info");

  try {
    const res = await getSiswa();
    siswa.value = res.data;

    toast("Data berhasil dimuat", "success");
  } catch (err) {
    toast("Gagal memuat data", "error");
  } finally {
    loading.value = false;
  }
});

const total = computed(() => siswa.value.length);
const sudah = computed(
  () => siswa.value.filter((s) => s.status === "Sudah").length,
);
const belum = computed(
  () => siswa.value.filter((s) => s.status !== "Sudah").length,
);

const listKelas = computed(() => [...new Set(siswa.value.map((s) => s.kelas))]);

const filtered = computed(() =>
  siswa.value.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.value.toLowerCase()) &&
      (kelas.value ? s.kelas === kelas.value : true),
  ),
);

function goLogin(s) {
  router.push(`/login/${s.id}/${s.nama}`);
}

function viewLocation(s) {
  router.push({
    path: "/map-view",
    query: {
      id: s.id,
      nama: s.nama,
    },
  });
}
</script>
