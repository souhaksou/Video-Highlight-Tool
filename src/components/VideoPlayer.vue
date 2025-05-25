<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { openModal } from 'jenesius-vue-modal';
import LoadingOverlay from '@/modals/LoadingOverlay.vue';
import slider from 'vue3-slider';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { videoFile, duration } = videoStore;
import { formatTime } from '@/utils/time';

// 載入影片
const videoUrl = ref(null);
const loadVideo = () => {
  if (videoFile) {
    videoUrl.value = URL.createObjectURL(videoFile);
  }
};
onMounted(async () => {
  loadVideo();
  const loading = await openModal(LoadingOverlay);
  setTimeout(() => {
    loading.close();
  }, 1000);
});
onUnmounted(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
});

const videoRef = ref(null);
const isPlaying = ref(false);
// 播放狀態切換
const togglePlay = () => {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
    isPlaying.value = true;
  } else {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};
const onEnded = () => {
  isPlaying.value = false;
};
// 時間顯示
const currentTime = ref(0); // 滑桿位置，用於拖曳與播放進度
const displayTime = ref(0); // 顯示時間，一秒更新一次
let lastDisplaySec = -1;
const onTimeUpdate = () => {
  const now = videoRef.value?.currentTime ?? 0;
  currentTime.value = now; // 每幀同步滑桿進度
  const sec = Math.floor(now);
  if (sec !== lastDisplaySec) {
    displayTime.value = sec; // 每秒更新顯示
    lastDisplaySec = sec;
  }
};

const isSeeking = ref(false);
const wasPlaying = ref(false);
const onSeekStart = () => {
  isSeeking.value = true;
  wasPlaying.value = isPlaying.value;
  if (videoRef.value) {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};
const onSeekEnd = () => {
  isSeeking.value = false;
  if (videoRef.value) {
    videoRef.value.currentTime = currentTime.value;
    if (wasPlaying.value) {
      videoRef.value.play();
      isPlaying.value = true;
    }
  }
};
</script>

<template>
  <div class="p:16 bg:body">
    <p class="f:20 f:bold fg:white mb:8">Preview</p>
    <div class="bg:black">
      <!-- video -->
      <div v-if="!videoUrl" class="aspect:16/9 w:full h:full max-h:600"></div>
      <div class="aspect:16/9 w:full max-h:600 overflow:hidden flex jc:center ai:center">
        <video ref="videoRef" :src="videoUrl" @timeupdate="onTimeUpdate" @ended="onEnded"
          class="w:full h:full object-fit:contain r:4" />
      </div>
      <!-- controls -->
      <div class="p:8 flex jc:space-between ai:center">
        <div class="flex jc:space-between ai:center {inline-block;p:4;fg:white;f:20;}>button">
          <button><i class="bi bi-skip-start-fill"></i></button>
          <button @click="togglePlay">
            <i v-show="!isPlaying" class="bi bi-play-fill"></i>
            <i v-show="isPlaying" class="bi bi-pause-fill"></i>
          </button>
          <button><i class="bi bi-skip-end-fill"></i></button>
        </div>
        <div class="fg:white f:14 flex ai:center user-select:none">
          <p> {{ `${formatTime(currentTime)}` }}</p>
          <p class="mx:4">/</p>
          <p> {{ `${formatTime(duration)}` }}</p>
        </div>
      </div>
      <!-- progress -->
      <div class="p:8">
        <slider v-model="currentTime" :min="0" :max="duration" :color="'#0DCAF0'" :track-color="'#CFF4FC'"
          :tooltip="true" :formatTooltip="formatTime" :step="0.1" :height="10" @drag-start="onSeekStart"
          @drag-end="onSeekEnd" />
      </div>
    </div>
  </div>
</template>