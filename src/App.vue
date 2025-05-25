<script setup>
import { container } from "jenesius-vue-modal";
const WidgetContainerModal = container;
</script>

<template>
  <div class="max-w:screen-3xl mx:auto">
    <RouterView />
  </div>
  <widget-container-modal />
</template>