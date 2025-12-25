<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('http://1225gy.jingchaowan.dpdns.org/help')

function goto() {
  window.open(url.value)
}
</script>