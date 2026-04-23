<template>
  <div class="fixed top-5 right-5 z-50 space-y-3">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg text-white min-w-[260px]"
        :class="getColor(t.type)"
      >
        <div class="flex items-center gap-2">
          <span>{{ getIcon(t.type) }}</span>
          <span class="text-sm">{{ t.message }}</span>
        </div>

        <button
          @click="remove(t.id)"
          class="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const toasts = reactive([]);

// ADD TOAST
function add(message, type = "success", duration = 3000) {
  const id = Date.now() + Math.random();

  toasts.push({
    id,
    message,
    type
  });

  setTimeout(() => remove(id), duration);
}

// REMOVE TOAST
function remove(id) {
  const index = toasts.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
  }
}

// STYLE
function getColor(type) {
  switch (type) {
    case "success": return "bg-green-500";
    case "error": return "bg-red-500";
    case "warning": return "bg-yellow-500 text-black";
    default: return "bg-blue-500";
  }
}

// ICON
function getIcon(type) {
  switch (type) {
    case "success": return "✔";
    case "error": return "✖";
    case "warning": return "⚠";
    default: return "ℹ";
  }
}

defineExpose({ add });
</script>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>