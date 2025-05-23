<script setup>
import { ref } from 'vue';
import { openModal } from "jenesius-vue-modal";
import ErrorMsg from '@/modals/ErrorMsg.vue';

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
const processFile = async (file) => {
  if (file && file.type.startsWith('video/')) {
    console.log('影片檔案：', file)
  } else {
    await openModal(ErrorMsg, { msg: '請上傳影片檔案！' });
  }
}
</script>

<template>
  <div @click="uploadFile" @dragover.prevent @drop.prevent="handleDrop"
    class="max-w:screen-2xs mx:auto b:2|solid|primary-border b:dashed p:32 r:8 cursor:pointer user-select:none">
    <p class="f:48 fg:primary t:center mb:16"><i class="bi bi-cloud-arrow-up-fill"></i></p>
    <p class="t:center">Drag and drop here
      <br>or<span class="fg:primary">&nbsp;browse</span>
    </p>
  </div>
  <input @change="handleFileChange" type="file" accept="video/*" ref="fileInput" hidden />
</template>