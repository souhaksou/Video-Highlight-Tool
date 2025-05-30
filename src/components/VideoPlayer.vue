<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { openModal } from 'jenesius-vue-modal';
import LoadingOverlay from '@/modals/LoadingOverlay.vue';
import slider from 'vue3-slider';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { videoFile, duration, setCurrentIndex } = videoStore;
const { transcript, currentIndex } = storeToRefs(videoStore);
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
  // 👉 當 highlightMode 開啟 且 沒有區塊，不能播放
  if (highlightMode.value && highlightedBlocks.value.length === 0) return; // ❌ 阻止播放
  // highlight 模式且已選擇區塊
  if (highlightMode.value && currentIndex.value !== null) {
    // 🔵 使用 find 找 highlightedBlocks 裡 originalIndex 符合 currentIndex 的區塊
    const block = highlightedBlocks.value.find(b => b.originalIndex === currentIndex.value);
    if (!block) return;
    if (videoRef.value.currentTime >= block.end) {
      videoRef.value.currentTime = block.start;
    }
  }
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
const autoPlayNext = ref(true); // 預設為開啟
const hasEndedBlock = ref(false); // 是否已經處理過這段結尾
const currentTime = ref(0); // 滑桿位置，用於拖曳與播放進度
const displayTime = ref(0); // 顯示時間，一秒更新一次
let lastDisplaySec = -1;
const FRAME_BUFFER = 0.05; // 可依實際影片幀率調整（30fps 約 0.033 秒）
const onTimeUpdate = () => {
  const now = videoRef.value?.currentTime ?? 0;

  // ✅ 基本時間更新邏輯：**不論 highlightMode 是否開啟都要執行**
  currentTime.value = now;
  const sec = Math.floor(now);
  if (sec !== lastDisplaySec) {
    displayTime.value = sec;
    lastDisplaySec = sec;
  }

  // ❌ 拖曳中 或 未開啟 highlight 模式 或 無 currentIndex，不執行區塊邏輯
  if (isSeeking.value || !highlightMode.value || currentIndex.value === null) return;

  // ✅ 區塊播放邏輯
  const block = highlightedBlocks.value.find(b => b.originalIndex === currentIndex.value);
  if (!block) return;

  if (now >= block.end - FRAME_BUFFER && !hasEndedBlock.value) {
    hasEndedBlock.value = true;

    if (autoPlayNext.value) {
      const currentIdx = highlightedBlocks.value.findIndex(b => b.originalIndex === currentIndex.value);
      const nextBlock = highlightedBlocks.value[currentIdx + 1];
      if (nextBlock) {
        setCurrentIndex(nextBlock.originalIndex);
        nextTick(() => {
          setTimeout(() => {
            if (videoRef.value?.paused) {
              videoRef.value.play();
              isPlaying.value = true;
            }
          }, 100);
        });
        return;
      }
    }

    if (videoRef.value) {
      videoRef.value.pause();
      isPlaying.value = false;
      videoRef.value.currentTime = block.end;
      currentTime.value = block.end;
    }
  }

  if (now < block.end - FRAME_BUFFER) {
    hasEndedBlock.value = false;
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

const highlightMode = ref(true);
const highlightedBlocks = computed(() => {
  const result = [];
  const transcriptList = transcript.value;
  for (let i = 0; i < transcriptList.length; i++) {
    const item = transcriptList[i];
    if (item.highlighted) {
      result.push({
        start: item.start,
        end: item.end,
        originalIndex: i
      });
    }
  }
  return result;
});
const onVideoLoaded = () => {
  if (highlightedBlocks.value.length === 0) return;
  const firstOriginalIndex = highlightedBlocks.value[0].originalIndex;
  setCurrentIndex(firstOriginalIndex);
};

const previous = () => {
  if (!highlightMode.value) return;
  // 🔵 找出目前 currentIndex（originalIndex）在 highlightedBlocks 的位置
  const currentPos = highlightedBlocks.value.findIndex(b => b.originalIndex === currentIndex.value);
  if (currentPos > 0) {
    // 🔵 設定前一個區塊的 originalIndex
    const prevBlock = highlightedBlocks.value[currentPos - 1];
    setCurrentIndex(prevBlock.originalIndex);
  }
};
const next = () => {
  if (!highlightMode.value) return;
  const currentPos = highlightedBlocks.value.findIndex(b => b.originalIndex === currentIndex.value);
  if (currentPos !== -1 && currentPos < highlightedBlocks.value.length - 1) {
    const nextBlock = highlightedBlocks.value[currentPos + 1];
    setCurrentIndex(nextBlock.originalIndex);
  }
};

// watch currentIndex 跳轉影片段落
const resetVideoToStart = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    isPlaying.value = false;
    videoRef.value.currentTime = 0;
    currentTime.value = 0;
    displayTime.value = 0;
  }
};

watch(currentIndex, (newOriginalIndex) => {
  if (!highlightMode.value) return;
  hasEndedBlock.value = false;
  // 1. 記錄跳段前是否正在播放
  const wasPlayingBeforeJump = videoRef.value && !videoRef.value.paused;
  if (newOriginalIndex === null) {
    resetVideoToStart();
    return;
  }
  const block = highlightedBlocks.value.find(b => b.originalIndex === newOriginalIndex);
  if (!block) {
    resetVideoToStart();
    return;
  }
  if (!videoRef.value) return;
  // 2. 跳段：先暫停、設時間
  videoRef.value.pause();
  isPlaying.value = false;
  videoRef.value.currentTime = block.start;
  currentTime.value = block.start;
  displayTime.value = Math.floor(block.start);
  // 3. 如果跳段前是播放中，就接著播放
  if (wasPlayingBeforeJump) {
    nextTick(() => {
      videoRef.value.play();
      isPlaying.value = true;
    });
  }
});

watch(highlightedBlocks, (newBlocks) => {
  if (newBlocks.length === 0) {
    // 所有都被取消，重設
    setCurrentIndex(null);
    return;
  }
  // 檢查目前 currentIndex 是否還存在於新的 highlightedBlocks 裡
  const currentBlockStillExists = newBlocks.some(
    block => block.originalIndex === currentIndex.value
  );
  if (!currentBlockStillExists) {
    // 找出比 currentIndex 小的最後一個（往前找）
    const previous = [...newBlocks]
      .reverse()
      .find(block => block.originalIndex < currentIndex.value);
    if (previous) {
      setCurrentIndex(previous.originalIndex);
    } else {
      // 沒有比它小的，就跳到第一個
      setCurrentIndex(newBlocks[0].originalIndex);
    }
  }
});

watch(highlightMode, (enabled) => {
  if (!videoRef.value) return;
  if (enabled) {
    // ✅ highlightMode 被打開時，要立即停止播放
    videoRef.value.pause();
    isPlaying.value = false;
    if (currentIndex.value === null) {
      videoRef.value.currentTime = 0;
      currentTime.value = 0;
      displayTime.value = 0;
    }
  }
});

const getPositionPercentage = (start) => {
  return ((start / duration) * 100).toFixed(2);
};

const getWidthPercentage = (start, end) => {
  return (((end - start) / duration) * 100).toFixed(2);
};
const blockCss = (block) => {
  const { start, end } = block;
  const left = getPositionPercentage(start);
  const width = getWidthPercentage(start, end);
  return `left:${left}% w:${width}%`;
};

const currentSubtitle = computed(() => {
  let result = '';
  if (currentIndex.value !== null && transcript.value[currentIndex.value]) {
    result = transcript.value[currentIndex.value].text;
  }
  return result;
});
</script>

<template>
  <div
    class="p:16 bg:body h:full min-h:calc(50vh-16px) max-h:calc(50vh-16px) {min-h:calc(100vh-64px);max-h:calc(100vh-64px);}@xs">
    <p class="f:20 f:bold fg:white hidden block@xs">Preview</p>
    <div class="bg:black mb:4 mb:16@xs">
      <!-- video -->
      <div v-if="!videoUrl" class="aspect:16/9 w:full h:full max-h:600"></div>
      <div class="aspect:16/9 w:full max-h:600 overflow:hidden flex jc:center ai:center rel">
        <video ref="videoRef" :src="videoUrl" @timeupdate="onTimeUpdate" @ended="onEnded"
          @loadedmetadata="onVideoLoaded" class="w:full h:full object-fit:contain r:4" />
        <div v-show="highlightMode"
          class="w:full abs bottom:4 left:0 f:14 fg:white t:center line-height:1.2 bottom:8@xs">
          <span class="inline-block p:4 bg:rgb(0,0,0,0.3)">{{ currentSubtitle }}</span>
        </div>
      </div>
      <!-- controls -->
      <div class="p:8 flex@xs jc:space-between ai:center">
        <div class="flex jc:space-between ai:center {inline-block;p:2|4;fg:white;f:20;}>button {py:4;}>button@xs">
          <button @click="previous"><i class="bi bi-skip-start-fill"></i></button>
          <div class="w:16"></div>
          <button @click="togglePlay">
            <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
          </button>
          <div class="w:16"></div>
          <button @click="next"><i class="bi bi-skip-end-fill"></i></button>
          <div class="w:16"></div>
          <button :disabled="!highlightMode" @click="autoPlayNext = !autoPlayNext"
            :class="`fg:${autoPlayNext && highlightMode ? '' : 'gray!'}`">
            <i class="mr:4 hidden inline@xs" :class="autoPlayNext ? 'bi bi-toggle2-on' : 'bi-toggle2-off'"></i>
            <span class="f:12 translateY(-2px) inline-block">AutoNext</span>
          </button>
          <div class="w:16"></div>
          <button @click="highlightMode = !highlightMode" :class="`fg:${highlightMode ? '' : 'gray!'}`">
            <i class="mr:4 hidden inline@xs" :class="highlightMode ? 'bi bi-toggle2-on' : 'bi-toggle2-off'"></i>
            <span class="f:12 translateY(-2px) inline-block">HighlightMode</span>
          </button>
        </div>
        <div class="h:4"></div>
        <div class="fg:white f:12 f:14@xs flex jc:end ai:center user-select:none">
          <p> {{ `${formatTime(currentTime)}` }}</p>
          <p class="mx:4">/</p>
          <p> {{ `${formatTime(duration)}` }}</p>
        </div>
      </div>
    </div>
    <!-- progress -->
    <div class="p:4|8 py:8@xs">
      <div class="rel">
        <slider v-model="currentTime" :disabled="highlightMode" :min="0" :max="duration" :color="'#374151'"
          :track-color="'#374151'" :tooltip="true" :formatTooltip="formatTime" :step="0.1" :height="20"
          @drag-start="onSeekStart" @drag-end="onSeekEnd" />
        <div v-show="highlightMode" v-for="block in highlightedBlocks" :key="block.originalIndex"
          @click="setCurrentIndex(block.originalIndex)" class="h:20 r:2 bg:#3C82F6 abs top:0 z:10"
          :class="`${blockCss(block)}`" />
      </div>
    </div>
  </div>
</template>

<style>
.vue3-slider .track,
.vue3-slider .track-filled {
  border-radius: 2px !important;
}

.vue3-slider .handle {
  border-radius: 0px !important;
  background-color: red !important;
  width: 2px !important;
  transform: scale(1) !important;
  transform: translateX(13.5px) !important;
  z-index: 50;
}
</style>