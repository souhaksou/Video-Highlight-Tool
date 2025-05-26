<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { setTranscript, setHighlighted, setCurrentIndex, duration } = videoStore;
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
  <OverlayScrollbarsComponent class="h:full min-h:calc(100vh-64px) max-h:calc(100vh-64px) bg:secondary-bg">
    <div class="p:16">
      <p class="f:20 f:bold mb:16">Transcript</p>
      <div v-for="group in groups" :key="group.type" class="mb:24">
        <p class="f:bold mb:8">{{ group.type }}</p>
        <div v-for="index in group.index" :key="index" ref="items" @click="setHighlighted(index)"
          class="f:14 p:8 mb:8 r:4 flex jc:start ai:start user-select:none cursor:pointer"
          :class="`bg:${transcript[index].highlighted ? 'primary' : 'white'} b:2|solid|${index === currentIndex ? 'current' : 'white'}`">
          <p @click.stop="jumpToBlock(index)" class="mr:8 f:bold cursor:pointer transition:200ms {fg:current;}:hover"
            :class="`fg:${transcript[index].highlighted ? 'white' : 'primary'}`"> {{
              formatTime(transcript[index].start) }}</p>
          <p :class="`fg:${transcript[index].highlighted ? 'white' : 'black'}`">{{ transcript[index].text }}</p>
        </div>
      </div>
    </div>
  </OverlayScrollbarsComponent>
</template>