<script setup>
import { popModal } from 'jenesius-vue-modal';

const props = defineProps({
    msg: String,
});

const close = () => {
    popModal();
}
</script>

<template>
    <div class="bg:white p:16|20 r:8 w:full max-w:360">
        <div class="flex jc:end mb:16">
            <button class="block" @click="close"><i class="bi bi-x-lg fg:black f:20"></i></button>
        </div>
        <p class="t:center p:16 f:32 fg:red f:bold">{{ props.msg }}</p>
        <div class="h:32"></div>
    </div>
</template>