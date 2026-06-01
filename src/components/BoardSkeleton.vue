<template>
  <div class="board-skeleton" data-testid="board-skeleton" aria-busy="true" aria-label="Loading board">
    <div class="board-skeleton__header">
      <div class="board-skeleton__line board-skeleton__line--eyebrow"></div>
      <div class="board-skeleton__line board-skeleton__line--title"></div>
      <div class="board-skeleton__line board-skeleton__line--subtitle"></div>
    </div>

    <div class="board-skeleton__toolbar">
      <div class="board-skeleton__panel"></div>
      <div class="board-skeleton__panel"></div>
    </div>

    <div class="board-skeleton__columns">
      <div v-for="index in 4" :key="index" class="board-skeleton__column">
        <div class="board-skeleton__line board-skeleton__line--column-title"></div>
        <div class="board-skeleton__card"></div>
        <div class="board-skeleton__card"></div>
        <div class="board-skeleton__card board-skeleton__card--short"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-skeleton {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.board-skeleton__header,
.board-skeleton__panel,
.board-skeleton__column,
.board-skeleton__card,
.board-skeleton__line {
  position: relative;
  overflow: hidden;
  background: #e2e8f0;
  border-radius: 0.75rem;
}

.board-skeleton__header {
  padding: 1.75rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 1.5rem;
  background: #f1f5f9;
}

.board-skeleton__line {
  height: 0.85rem;
  margin-bottom: 0.65rem;
  border-radius: 999px;
}

.board-skeleton__line--eyebrow {
  width: 5rem;
  height: 0.65rem;
}

.board-skeleton__line--title {
  width: min(280px, 70%);
  height: 1.5rem;
}

.board-skeleton__line--subtitle {
  width: min(420px, 90%);
}

.board-skeleton__toolbar {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

@media screen and (min-width: 960px) {
  .board-skeleton__toolbar {
    grid-template-columns: 1fr 1fr;
  }
}

.board-skeleton__panel {
  min-height: 148px;
}

.board-skeleton__columns {
  display: grid;
  gap: 1rem;
}

@media screen and (min-width: 700px) {
  .board-skeleton__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (min-width: 1100px) {
  .board-skeleton__columns {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.board-skeleton__column {
  min-height: 440px;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
}

.board-skeleton__line--column-title {
  width: 60%;
  margin-bottom: 1rem;
}

.board-skeleton__card {
  height: 88px;
  margin-bottom: 0.75rem;
}

.board-skeleton__card--short {
  width: 75%;
}

.board-skeleton__header::after,
.board-skeleton__panel::after,
.board-skeleton__column::after,
.board-skeleton__card::after,
.board-skeleton__line::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: board-skeleton-shimmer 1.4s infinite;
}

@keyframes board-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
