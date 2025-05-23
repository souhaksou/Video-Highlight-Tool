<script setup>
import { ref } from 'vue';

import UploadArea from '@/components/UploadAria.vue';

</script>

<template>
  <section class="p:32 h:full min-h:100vh">
    <!-- container -->
    <div class="max-w:screen-lg mx:auto">
      <h1 class="f:32 f:bold t:center mb:64">Video Highlight Tool</h1>
      <!-- <div class="grid-cols:2">
        <div>a</div>
        <div>b</div>
      </div> -->
      <UploadArea />
    </div>
  </section>
</template>