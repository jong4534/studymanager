<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  task: Object, // { id, title, status, note }
  loading: Boolean
})

const emit = defineEmits(['update'])

// Local state for note to avoid too many API calls while typing
const localNote = ref(props.task.note || '')

watch(() => props.task.note, (val) => {
  localNote.value = val
})

function toggleStatus() {
  if (props.loading) return
  const newStatus = props.task.status === 'Done' ? 'Not Done' : 'Done'
  emit('update', { ...props.task, status: newStatus })
}

function saveNote() {
    if (props.loading || localNote.value === props.task.note) return
    emit('update', { ...props.task, note: localNote.value })
}
</script>

<template>
  <div class="task-item" :class="{ done: task.status === 'Done' }">
    <div class="task-header" @click="toggleStatus">
      <div class="checkbox">
        <span v-if="task.status === 'Done'">✔</span>
      </div>
      <span class="task-title">{{ task.title }}</span>
    </div>
    
    <div class="task-body">
      <input 
        v-model="localNote" 
        @blur="saveNote"
        @keyup.enter="saveNote"
        placeholder="배운 내용이나 생각을 적어주세요!" 
        class="note-input"
        :disabled="loading"
      />
    </div>
  </div>
</template>

<style scoped>
.task-item {
  background: white;
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  border-left: 6px solid #eee;
}

.task-item.done {
  border-left-color: var(--color-success);
  background-color: #f9fff9;
}

.task-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 12px;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
  font-weight: bold;
  background: white;
  transition: all 0.2s;
}

.task-item.done .checkbox {
  border-color: var(--color-success);
  background: var(--color-success);
  color: white;
}

.task-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--color-text);
}

.task-item.done .task-title {
  text-decoration: line-through;
  color: #888;
}

.note-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  background: #fafafa;
  outline: none;
  transition: border-color 0.2s;
}

.note-input:focus {
  border-color: var(--color-accent);
  background: white;
}
</style>
