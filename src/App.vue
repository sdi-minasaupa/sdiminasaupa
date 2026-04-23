<template>
  <div>
    <!-- Navbar -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div
        class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center"
      >
        <h1 class="font-bold text-lg">📍 Verifikasi Siswa</h1>
        <span class="text-sm text-gray-500">SDI Minasa Upa</span>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-6xl mx-auto p-4">
      <router-view />
    </main>

    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, provide } from "vue";
import Toast from "./components/Toast.vue";

const toastRef = ref();

// global function
const showToast = (message, type = "success") => {
  toastRef.value.add(message, type);
};

// inject ke semua component
provide("toast", showToast);
</script>
