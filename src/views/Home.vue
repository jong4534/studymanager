<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function go(name) {
  // Save selection just in case, but URL drives state now
  localStorage.setItem('lastChild', name)
  router.push(`/dashboard/${name}`)
}
</script>

<template>
  <div class="home-container">
    <h1>누구의 공부방인가요? 🏠</h1>
    
    <div class="selection-area">
      <button class="child-card suwan" @click="go('수완')">
        <span class="emoji">👦</span>
        <span class="name">수완</span>
      </button>
      
      <button class="child-card suyeon" @click="go('수연')">
        <span class="emoji">👧</span>
        <span class="name">수연</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 20px;
}

h1 {
  margin-bottom: 40px;
  color: var(--color-text);
}

.selection-area {
  display: flex;
  gap: 30px;
}

.child-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 200px;
  border-radius: var(--radius-lg);
  background: white;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s;
  border: 4px solid transparent;
}

.child-card:hover {
  transform: scale(1.05);
}

.suwan:hover {
  border-color: var(--color-secondary);
}

.suyeon:hover {
  border-color: var(--color-primary);
}

.emoji {
  font-size: 3rem;
  margin-bottom: 16px;
}

.name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
}
</style>
