<script setup>
import { ref } from 'vue';
import { openModal } from "jenesius-vue-modal";
import ErrorMsg from '@/modals/ErrorMsg.vue';
import { useVideoStore } from '@/stores/useVideoStore';
const videoStore = useVideoStore();
const { setVideoFile, setDuration } = videoStore;

const fileInput = ref(null);
const uploadFile = () => {
  fileInput.value?.click();
};
const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (file) processFile(file);
};
const handleDrop = (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) processFile(file);
};
const clearFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
const MAX_SIZE_MB = 200;
const MAX_DURATION = 3599.9; // < 60 分
const MIN_DURATION = 1;      // ≥ 1 秒（含 0.1 秒也算 1 秒）
const processFile = (file) => {
  if (!file || !file.type.startsWith('video/')) {
    clearFileInput();
    openModal(ErrorMsg, { msg: 'Video files only.' });
    return;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    clearFileInput();
    openModal(ErrorMsg, { msg: `Video size must not exceed ${MAX_SIZE_MB}MB.` });
    return;
  }
  const fileURL = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.src = fileURL;
  const cleanUp = () => {
    URL.revokeObjectURL(fileURL);
    clearFileInput();
  };
  video.onloadedmetadata = () => {
    cleanUp();
    const duration = video.duration;
    const rounded = Math.ceil(duration);
    if (rounded < MIN_DURATION) {
      openModal(ErrorMsg, { msg: 'Video must be at least 1 second long.' });
      return;
    }
    if (duration > MAX_DURATION) {
      openModal(ErrorMsg, { msg: 'Video duration must be less than 60 minutes.' });
      return;
    }
    setVideoFile(file);
    setDuration(duration);
  };
  video.onerror = () => {
    cleanUp();
    openModal(ErrorMsg, { msg: 'Can’t read this video. Try again.' });
    return;
  };
};

</script>

<template>
  <div @click="uploadFile" @dragover.prevent @drop.prevent="handleDrop"
    class="max-w:screen-2xs mx:auto b:2|solid|primary-border b:dashed p:32 r:8 cursor:pointer user-select:none">
    <p class="f:48 fg:primary t:center mb:16"><i class="bi bi-cloud-arrow-up-fill"></i></p>
    <p class="f:18 mb:16">Drag and drop a video file here, or browse.</p>
    <p class="fg:gray-40 f:14">Only video files are accepted.<br>
      Maximum file size: 200MB.<br>
      Duration must be less than 1 hour.</p>
  </div>
  <input @change="handleFileChange" type="file" accept="video/*" ref="fileInput" hidden />
</template>