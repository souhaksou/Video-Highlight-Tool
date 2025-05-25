<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { isUploaded } = storeToRefs(videoStore);
import UploadArea from '@/components/UploadAria.vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import TranscriptEditor from '@/components/TranscriptEditor.vue';

</script>

<template>
  <section class="p:32 h:full min-h:100vh">
    <div class="max-w:screen-lg mx:auto">
      <h1 class="f:32 f:bold t:center mb:64">Video Highlight Tool</h1>
      <template v-if="isUploaded">
        <div class="grid-cols:2">
          <TranscriptEditor />
          <VideoPlayer />
        </div>
      </template>
      <template v-else>
        <UploadArea />
      </template>
    </div>
  </section>
</template>