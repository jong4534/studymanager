<script setup>
import { ref, defineEmits } from 'vue'

const props = defineProps({
  currentChild: String
})

const emit = defineEmits(['update:currentChild'])

const children = ['수완', '수연'] // Default names, can be changed

function selectChild(name) {
  emit('update:currentChild', name)
}
</script>

<template>
  <div class="child-selector">
    <button 
      v-for="child in children" 
      :key="child"
      :class="['child-btn', { active: currentChild === child }]"
      @click="selectChild(child)"
    >
      {{ child }}
    </button>
  </div>
</template>

<style scoped>
.child-selector {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.child-btn {
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  background-color: var(--color-white);
  color: var(--color-text);
  font-size: 1.1rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  border: 2px solid transparent;
}

.child-btn.active {
  background-color: var(--color-primary);
  color: white;
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}
</style>
