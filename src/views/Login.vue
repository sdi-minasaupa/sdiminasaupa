<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4"
  >
    <div class="w-full max-w-md">
      <!-- HEADER -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">Silahkan Login Menggunakan NISN</h1>
        <p class="text-gray-500 text-sm">Masuk untuk melanjutkan</p>
      </div>

      <!-- CARD -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <!-- NAMA SISWA -->
        <div class="mb-5 text-center">
          <p class="text-sm text-gray-500">Siswa</p>
          <h2 class="text-lg font-semibold">{{ nama }}</h2>
        </div>

        <!-- INPUT -->
        <div class="mb-4">
          <label class="text-sm text-gray-600">NISN</label>

          <div
            class="mt-1 flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500 transition"
          >
            <!-- ICON -->
            <span class="text-gray-400 mr-2">🔑</span>

            <input
              v-model="nisn"
              placeholder="Masukkan NISN"
              class="w-full py-2 outline-none"
            />
          </div>
        </div>

        <!-- BUTTON -->
        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full mt-3 flex justify-center items-center gap-2 py-2 rounded-xl font-medium transition-all duration-200"
          :class="
            loading
              ? 'bg-gray-300 text-gray-500'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow hover:scale-[1.02]'
          "
        >
          <!-- LOADING -->
          <svg
            v-if="loading"
            class="animate-spin h-5 w-5 text-white"
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
            {{ loading ? "Memverifikasi..." : "Masuk" }}
          </span>
        </button>

        <!-- FOOTER -->
        <p class="text-xs text-center text-gray-400 mt-4">
          Gunakan NISN yang valid
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { login } from "../api/api";

const toast = inject("toast");

const route = useRoute();
const router = useRouter();

const id = route.params.id;
const nama = route.params.nama;

const nisn = ref("");
const loading = ref(false);

async function handleLogin() {
  if (!nisn.value) {
    toast("NISN wajib diisi", "warning");
    return;
  }

  loading.value = true;

  try {
    const res = await login(id, nisn.value);

    if (res.data.success) {
      // simpan session
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          id,
          nama,
          nisn: nisn.value,
        }),
      );

      toast("Login berhasil", "success");

      router.push("/map");
    } else {
      toast("NISN salah", "error");
    }
  } catch (err) {
    toast("Gagal koneksi server", "error");
  } finally {
    loading.value = false;
  }
}
</script>
