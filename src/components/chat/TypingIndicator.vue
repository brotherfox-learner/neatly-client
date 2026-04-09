<template>
  <div class="chat-bubble-container is-bot">
    <div class="chat-bubble typing-indicator">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<style scoped>
.chat-bubble-container {
  display: flex;
  width: 100%;
  margin-bottom: 8px;
}

.is-bot {
  justify-content: flex-start;
}

.chat-bubble {
  padding: 12px 16px;
  background-color: #ffffff;
  border: 1px solid #e4e6ed;
  border-radius: 16px 16px 16px 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.dot {
  width: 6px;
  height: 6px;
  background-color: #1e3a5f;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
