<script setup>
import { ref } from 'vue'
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

// 若是用本地影片，直接 import
import testVideo from '@/assets/test.mp4'

const playerOptions = ref({
  controls: false,
  autoplay: false,
  preload: 'auto',
  responsive: true,
  fluid: true,
  sources: [
    {
      src: testVideo,
      type: 'video/mp4'
    }
  ]
})

const onPlayerReady = (player) => {
  console.log('Video.js player is ready:', player)
  // 這裡可以儲存 player 實例以便之後控制
}
</script>

<template>
  <main>
    home
  </main>
  <div class="video-container">
    <VideoPlayer class="video-js vjs-default-skin" :options="playerOptions" @ready="onPlayerReady" />
  </div>
</template>

<style scoped>
.video-container {
  max-width: 800px;
  margin: auto;
}
</style>
