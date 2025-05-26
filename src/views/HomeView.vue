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
  <section class="p:16 p:32@xs h:full min-h:100vh overflow-y:hidden">
    <div class="max-w:screen-lg mx:auto">
      <h1 v-show="!isUploaded" class="f:32 f:bold t:center my:32 {mt:0;mb:64;}@xs">Video Highlight Tool</h1>
      <template v-if="isUploaded">
        <div class="grid-cols:1 grid-cols:2@xs">
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