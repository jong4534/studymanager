<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import TaskList from '../components/TaskList.vue'
import StatsSidebar from '../components/StatsSidebar.vue'
import { getTasks } from '../api/sheets.js'

const route = useRoute()
// Use route param for current child, or fallback to default
const currentChild = computed(() => route.params.name || '수완')

const allLogs = ref([])
const allSettings = ref([])
const loading = ref(false)

const normalizeKeys = (arr) => {
  return arr.map(obj => {
    const newObj = {}
    Object.keys(obj).forEach(key => {
      const newKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
      let finalKey = newKey
      if (newKey === 'Id') finalKey = 'ID'
      newObj[finalKey] = obj[key]
    })
    return newObj
  })
}

async function loadGlobalData() {
  loading.value = true
  try {
    const data = await getTasks() 
    if (data.logs) {
        allLogs.value = normalizeKeys(data.logs)
    } else if (Array.isArray(data)) {
        allLogs.value = normalizeKeys(data)
    }
    
    if (data.settings) {
        allSettings.value = normalizeKeys(data.settings)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
    loadGlobalData()
})

function refreshData() {
    loadGlobalData()
}

function handleLocalUpdate(payload) {
    const index = allLogs.value.findIndex(l => l.ID === payload.ID)
    if (index !== -1) {
        if (payload.Status) allLogs.value[index].Status = payload.Status
        if (payload.Note) allLogs.value[index].Note = payload.Note
    } else {
        allLogs.value.push(payload)
    }
}
</script>

<template>
  <div class="dashboard-container">
    <header>
      <router-link to="/" class="home-icon-btn" aria-label="처음으로">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </router-link>
      <h1>{{ currentChild }}의 공부방 📝</h1>
    </header>
    
    <main class="main-layout">
      <!-- Sidebar (PC: Left, Mobile: Bottom logic via CSS) -->
      <aside class="sidebar">
        <StatsSidebar :logs="allLogs" />
      </aside>

      <!-- Main Content -->
      <div class="content-area">
        <TaskList 
           :childName="currentChild"
           :injectedLogs="allLogs"
           :injectedSettings="allSettings"
           :globalLoading="loading"
           @refresh="refreshData"
           @local-update="handleLocalUpdate"
        />
      </div>

      <!-- Mobile Stats (Below content) -->
      <aside class="mobile-stats">
        <StatsSidebar :logs="allLogs" />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  min-height: 100vh;
  position: relative; /* For absolute header positioning context if needed, but header handles it */
}

header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-icon-btn {
  position: absolute;
  left: 0; /* Absolute Left */
  top: 50%;
  transform: translateY(-50%);
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.home-icon-btn:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: var(--shadow-md);
}

/* ... */

.main-layout {
  display: flex;
  flex-direction: column; 
  gap: 48px; /* Default gap */
}

.sidebar {
  display: none;
}

.mobile-stats {
  display: block;
  width: 100%;
}

/* ... */

/* PC Media Query */
@media (min-width: 768px) {
  .main-layout {
    flex-direction: row;
    align-items: flex-start;
    gap: 80px; /* Increased gap from 24px */
  }
/* ... */

  .sidebar {
    display: block;
    width: 280px;
    flex-shrink: 0;
  }

  .mobile-stats {
    display: none;
  }

  .content-area {
    flex-grow: 1;
    max-width: 600px;
    margin: 0; /* Reset */
  }
}
</style>
