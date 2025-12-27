<script setup>
import { computed } from 'vue'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

// Get YYYY-MM strings
const now = new Date()
const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

const prevDate = new Date()
prevDate.setMonth(prevDate.getMonth() - 1)
const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

// Labels
const monthLabels = {
  [currentMonthKey]: `${now.getFullYear()}년 ${now.getMonth() + 1}월`,
  [prevMonthKey]: `${prevDate.getFullYear()}년 ${prevDate.getMonth() + 1}월`
}

// Compute Stats
const stats = computed(() => {
  const result = {
    [prevMonthKey]: {},
    [currentMonthKey]: {}
  }

  props.logs.forEach(log => {
    // Log Date format likely "YYYY-MM-DD..." or ISO
    if (!log.Date || log.Status !== 'Done') return

    const dateStr = String(log.Date)
    // Extract YYYY-MM
    let key = ''
    if (dateStr.includes('T')) {
         key = dateStr.split('T')[0].substring(0, 7)
    } else {
         key = dateStr.substring(0, 7)
    }

    if (result[key] && log.Child) {
      if (!result[key][log.Child]) result[key][log.Child] = 0
      result[key][log.Child]++
    }
  })

  return result
})

// Helper to get sorted children names from stats to keep order consistent
const childrenNames = computed(() => {
    const names = new Set()
    Object.values(stats.value).forEach(monthData => {
        Object.keys(monthData).forEach(name => names.add(name))
    })
    return Array.from(names).sort() // Or maybe fixed order if we want?
})
</script>

<template>
  <div class="stats-card">
    <h3>📊 학습 통계</h3>
    
    <div class="month-block">
      <h4>{{ monthLabels[prevMonthKey] }}</h4>
      <ul>
        <li v-for="child in childrenNames" :key="'prev'+child">
          <span class="name">{{ child }}</span>
          <span class="count">{{ stats[prevMonthKey][child] || 0 }}회</span>
        </li>
      </ul>
    </div>

    <div class="divider"></div>

    <div class="month-block">
      <h4>{{ monthLabels[currentMonthKey] }}</h4>
      <ul>
        <li v-for="child in childrenNames" :key="'curr'+child">
            <span class="name">{{ child }}</span>
            <span class="count">{{ stats[currentMonthKey][child] || 0 }}회</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  width: 100%;
}

h3 {
  margin-bottom: 20px;
  text-align: center;
  color: var(--color-primary);
}

.month-block h4 {
  margin-bottom: 10px;
  color: #888;
  font-size: 0.9rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 1.1rem;
}

li:last-child {
  border-bottom: none;
}

.name {
  font-weight: bold;
  color: var(--color-text);
}

.count {
  color: var(--color-primary);
  font-weight: bold;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 20px 0;
}
</style>
