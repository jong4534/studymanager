<script setup>
import { ref, onMounted, computed, watch, toRefs } from 'vue'
import TaskItem from './TaskItem.vue'
import { addTask, updateTask } from '../api/sheets.js' // Removed getTasks from here

const props = defineProps({
  childName: String,
  injectedLogs: { type: Array, default: () => [] },
  injectedSettings: { type: Array, default: () => [] },
  globalLoading: Boolean
})

const emit = defineEmits(['refresh', 'local-update'])

// Use injected data
const { injectedLogs, injectedSettings } = toRefs(props)

const tasks = ref([])
const selectedDate = ref(getTodayString())

// Helpers
function getTodayString() {
  const d = new Date()
  return formatDate(d)
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function changeDate(days) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + days)
  selectedDate.value = formatDate(d)
}

function getDayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const week = ['일', '월', '화', '수', '목', '금', '토']
  return week[date.getDay()]
}

function getDisplayDate() {
  const dayChar = getDayOfWeek(selectedDate.value)
  const today = getTodayString()
  
  if (selectedDate.value === today) return `${selectedDate.value} (${dayChar})  오늘`
  return `${selectedDate.value} (${dayChar})`
}


function processTasks() {
  if (!props.childName) return

  // 1. Get Base Tasks from Settings
  // If we have injectedSettings, use them.
  const allSettings = injectedSettings.value
  
  const childSettings = allSettings.filter(s => s.Child === props.childName)
  const baseTaskTitles = childSettings.map(s => s.Task)
  
  let targetTitles = baseTaskTitles
  // Removed hardcoded fallback per user request to avoid flickering initial state
  // if (baseTaskTitles.length === 0 && ...)

  // 2. Find Logs
  const allLogs = injectedLogs.value
  const existingLogs = allLogs.filter(row => {
    let rowDate = ''
    if (row.Date) {
        const d = new Date(row.Date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        rowDate = `${year}-${month}-${day}`
    }
    return rowDate === selectedDate.value && row.Child === props.childName
  })

  // 3. Merge Strategies
  // S1: Tasks defined in Settings (Active Plan)
  // S2: Tasks found in Logs (Legacy Plan)
  // We want the Union of S1 and S2 so that past data isn't hidden.
  
  const loggedTitles = existingLogs.map(r => r.Task)
  // Combine sets to avoid duplicates
  const combinedTitles = Array.from(new Set([...targetTitles, ...loggedTitles]))

  // 4. Map to Display Objects
  tasks.value = combinedTitles.map(title => {
    const record = existingLogs.find(r => r.Task === title)
    return {
      id: record ? record.ID : null,
      title: title,
      status: record ? record.Status : 'Not Done',
      note: record ? record.Note : '',
      isNew: !record
    }
  })
}

watch(() => props.childName, processTasks)
watch(selectedDate, processTasks)
watch(injectedLogs, processTasks, { deep: true })
watch(injectedSettings, processTasks, { deep: true })

onMounted(() => {
  processTasks()
})

async function handleTaskUpdate(updatedTask) {
  // Find current task in our list
  const index = tasks.value.findIndex(t => t.title === updatedTask.title)
  if (index === -1) return

  // Optimistic update of the list display
  tasks.value[index] = updatedTask

  // Check if this is a fresh task (no ID yet)
  // Note: We check the *current state in tasks array* (tasks.value[index]) 
  // because multiple rapid clicks might have happened, and we might have already assigned an ID 
  // in a previous closure but processed it here. 
  // Actually, updatedTask passed from TaskItem might have old isNew value if props didn't update fast enough?
  // Safer to trust `tasks.value[index].isNew`.
  
  const currentTaskState = tasks.value[index]

  if (currentTaskState.isNew) {
    try {
      // 1. Generate ID on client side
      const newId = Date.now().toString()
      
      // 2. Update local task state IMMEDIATELY so next click knows it's an update
      tasks.value[index].id = newId
      tasks.value[index].isNew = false
      
      // 3. Update Global Logs (App.vue -> Stats)
      const newLog = {
          ID: newId, 
          Date: selectedDate.value,
          Child: props.childName,
          Task: updatedTask.title,
          Status: updatedTask.status,
          Note: updatedTask.note
      }
      emit('local-update', newLog)

      // 4. Send to API with our ID
      await addTask({
        taskId: newId, 
        date: selectedDate.value,
        child: props.childName,
        task: updatedTask.title,
        status: updatedTask.status,
        note: updatedTask.note
      })
    } catch (e) {
      console.error(e)
    }
  } else {
    // It's an update to an existing row
    try {
        const existingId = currentTaskState.id
        
        // Update Global Logs
        const updatedLog = {
             ID: existingId,
             Status: updatedTask.status,
             Note: updatedTask.note
        }
        emit('local-update', updatedLog)

        await updateTask(existingId, updatedTask.status, updatedTask.note)
    } catch (e) {
        console.error(e)
    }
  }
}
</script>

<template>
  <div class="task-list">
    <div v-if="globalLoading && tasks.length === 0" class="loading">불러오고 있어용!</div>
    
    <div v-else class="list-container">
      <div class="date-header">
        <button class="nav-btn" @click="changeDate(-1)">❮</button>
        <span class="date-display">{{ getDisplayDate() }}</span>
        <button class="nav-btn" @click="changeDate(1)">❯</button>
      </div>
      
      <div v-if="tasks.length === 0" class="empty-state">
        No tasks found in 'Settings' sheet for {{ childName }}.
      </div>

      <TaskItem 
        v-for="task in tasks" 
        :key="task.title"
        :task="task"
        :loading="globalLoading"
        @update="handleTaskUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-white);
  padding: 12px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.date-display {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--color-text);
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 8px 16px;
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.nav-btn:hover {
  background-color: #f0f0f0;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
