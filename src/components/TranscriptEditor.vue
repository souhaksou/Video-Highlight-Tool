<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { setTranscript, setHighlighted, setCurrentIndex, reset, duration } = videoStore;
const { transcript, groups, currentIndex } = storeToRefs(videoStore);
import { generateSentences } from '@/utils/transcriptGenerator';
import { formatTime } from '@/utils/time';
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import 'overlayscrollbars/overlayscrollbars.css';

onMounted(() => {
  setTranscript(generateSentences(duration));
});

const jumpToBlock = (index) => {
  if (!transcript.value[index].highlighted) setHighlighted(index);
  setCurrentIndex(index);
};
const items = ref([]);
watch(currentIndex, async (idx) => {
  await nextTick();
  const el = items.value[idx];
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

</script>

<template>
  <OverlayScrollbarsComponent
    class="h:full min-h:calc(50vh-16px) max-h:calc(50vh-16px) {min-h:calc(100vh-64px);max-h:calc(100vh-64px);}@xs bg:secondary-bg">
    <div class="p:16">
      <div class="flex jc:space-between ai:center mb:8 mb:16@xs">
        <p class="f:16 f:bold f:20@xs">Transcript</p>
        <button @click="reset" class="inline-block p:4|8 r:4 f:12 f:14@xs fg:white bg:red">Reset</button>
      </div>
      <div v-for="group in groups" :key="group.type" class="mb:16 mb:24@xs">
        <p class="f:14 f:16@xs f:bold mb:8">{{ group.type }}</p>
        <div v-for="index in group.index" :key="index" ref="items" @click="setHighlighted(index)"
          class="f:14 p:4|8 mb:8 r:4 {py:8;flex;}@xs jc:start ai:start user-select:none cursor:pointer"
          :class="`bg:${transcript[index].highlighted ? 'primary' : 'white'} b:2|solid|${index === currentIndex ? 'current' : 'white'}`">
          <p @click.stop="jumpToBlock(index)" class="mr:8@xs f:bold cursor:pointer transition:200ms {fg:current;}:hover"
            :class="`fg:${transcript[index].highlighted ? 'white' : 'primary'}`"> {{
              formatTime(transcript[index].start) }}</p>
          <p :class="`fg:${transcript[index].highlighted ? 'white' : 'black'}`">{{ transcript[index].text }}</p>
        </div>
      </div>
    </div>
  </OverlayScrollbarsComponent>
</template>