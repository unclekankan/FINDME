<template>
  <div class="app-container">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta?.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
