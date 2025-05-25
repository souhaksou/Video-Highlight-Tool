import { ref, computed, readonly } from 'vue';
import { defineStore } from 'pinia';

export const useVideoStore = defineStore('video', () => {

  const _videoFile = ref(null);
  const _duration = ref(null);
  const _isUploaded = computed(() => !!_videoFile.value);
  const _transcript = ref([]);
  const _groups = computed(() => {
    const groups = [];
    if (_transcript.value) {
      let current = null;
      _transcript.value.forEach((line, index) => {
        if (line.type !== current?.type) {
          current = { type: line.type, index: [] }
          groups.push(current)
        }
        current.index.push(index);
      });
    }
    return groups;
  });

  const setVideoFile = (file) => {
    _videoFile.value = file;
  };

  const setDuration = (seconds) => {
    _duration.value = seconds;
  };

  const setTranscript = (data) => {
    _transcript.value = data;
  };

  const reset = () => {
    _videoFile.value = null;
    _duration.value = null;
    _transcript.value = [];
  };

  return {
    videoFile: readonly(_videoFile),
    duration: readonly(_duration),
    isUploaded: _isUploaded,
    transcript: readonly(_transcript),
    groups: _groups,
    setVideoFile,
    setDuration,
    setTranscript,
    reset,
  };
});
