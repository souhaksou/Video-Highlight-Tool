<script setup>
import { onBeforeModalClose } from 'jenesius-vue-modal';

onBeforeModalClose((event) => {
    if (event.background || event.esc) return false;
});
</script>

<template>
    <div class="p:16|20 r:8 w:full max-w:360 t:center">
        <span class="loader"></span>
    </div>
</template>

<style scoped>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>