<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { setTranscript, duration } = videoStore;
const { transcript, groups } = storeToRefs(videoStore);
import { generateSentences } from '@/utils/transcriptGenerator';
import { formatTime } from '@/utils/time';
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import 'overlayscrollbars/overlayscrollbars.css';

onMounted(() => {
  setTranscript(generateSentences(duration));
  console.log(transcript.value, groups.value);
});
</script>

<template>
  <OverlayScrollbarsComponent class="h:full min-h:calc(100vh-176px) max-h:calc(100vh-176px) bg:secondary-bg">
    <div class="p:16">
      <p class="f:20 f:bold mb:16">Transcript</p>
      <div v-for="group in groups" :key="group.type" class="mb:24">
        <p class="f:bold mb:8">{{ group.type }}</p>
        <div v-for="index in group.index"
          class="f:14 p:8 mb:8 r:4 flex jc:start ai:start user-select:none cursor:pointer"
          :class="`b:2|solid|${transcript[index].suggested ? 'suggested' : 'white'} bg:${transcript[index].highlighted ? 'primary' : 'white'}`">
          <p class="mr:8 f:bold" :class="`fg:${transcript[index].highlighted ? 'white' : 'primary'}`"> {{
            formatTime(transcript[index].start) }}</p>
          <p :class="`fg:${transcript[index].highlighted ? 'white' : 'black'}`">{{ transcript[index].text }}</p>
        </div>
      </div>
    </div>
  </OverlayScrollbarsComponent>
</template>