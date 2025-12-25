<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('http://1225gy.jingchaowan.dpdns.org/git')

function goto() {
  window.open(url.value)
}
</script>
