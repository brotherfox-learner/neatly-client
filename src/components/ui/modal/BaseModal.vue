<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  /** Title displayed in the modal header */
  title: string
  /** Body message shown below the header */
  description: string
  /** Label for the cancel / secondary action button */
  cancelLabel?: string
  /** Label for the confirm / primary action button */
  confirmLabel?: string
  /** Controls visibility — use with v-model:open */
  open: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cancelLabel: "No, I don't",
  confirmLabel: 'Yes, I want to do...',
})

const emit = defineEmits<{
  /** Fired when the user clicks Cancel, the X button, or the backdrop */
  cancel: []
  /** Fired when the user clicks the Confirm button */
  confirm: []
  /** v-model:open support */
  'update:open': [value: boolean]
}>()

const titleId = useId()

function close(): void {
  emit('update:open', false)
}

function onCancel(): void {
  emit('cancel')
  close()
}

function onConfirm(): void {
  emit('confirm')
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="onCancel"
        @keydown.escape="onCancel"
      >
        <div
          class="modal-panel flex flex-col w-[631px] bg-white rounded [box-shadow:2px_2px_12px_rgba(64,50,133,0.12)]"
        >
          <!-- Header -->
          <header class="flex flex-row items-center px-6 py-2 h-14 border-b border-gray-300">
            <h2 :id="titleId" class="headline-5 text-black grow">{{ props.title }}</h2>

            <button
              type="button"
              class="flex items-center justify-center w-[41px] h-10 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Close modal"
              @click="onCancel"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </header>

          <!-- Body -->
          <section class="flex flex-col items-end p-6 gap-6">
            <div class="flex flex-col items-start w-full">
              <p class="body-1 text-gray-700">{{ props.description }}</p>
            </div>

            <!-- Button wrapper -->
            <div class="flex flex-row gap-4">
              <button
                type="button"
                class="h-12 px-8 bg-white border border-orange-500 rounded text-orange-500 font-open-sans font-semibold text-base cursor-pointer hover:bg-orange-100 active:bg-orange-200 transition-colors"
                @click="onCancel"
              >
                {{ props.cancelLabel }}
              </button>

              <button
                type="button"
                class="h-12 px-8 bg-orange-600 rounded text-white font-open-sans font-semibold text-base cursor-pointer hover:bg-orange-500 active:bg-orange-700 transition-colors"
                @click="onConfirm"
              >
                {{ props.confirmLabel }}
              </button>
            </div>
          </section>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.95);
}
</style>
