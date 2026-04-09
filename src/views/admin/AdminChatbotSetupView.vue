<script setup lang="ts">
import { ref } from "vue"
import { GripVertical, Pencil, Trash2, Plus, X, ChevronDown } from "lucide-vue-next"

type ReplyFormat = "" | "text" | "room_type"

interface SuggestionItem {
  id: string
  topic: string
  replyFormat: ReplyFormat
  replyTitle: string
  roomTypes: string[]
  buttonName: string
  editing: boolean
}

const greetingMessage = ref("")
const autoReplyMessage = ref("")
const isSaving = ref(false)

const formatOptions: { value: ReplyFormat; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "room_type", label: "Room type" },
]

const items = ref<SuggestionItem[]>([])
const dragFrom = ref<number | null>(null)
const dragOver = ref<number | null>(null)
const tagInput = ref("")

function addItem() {
  items.value.push({
    id: crypto.randomUUID(),
    topic: "",
    replyFormat: "",
    replyTitle: "",
    roomTypes: [],
    buttonName: "",
    editing: true,
  })
}

function removeItem(id: string) {
  items.value = items.value.filter((i) => i.id !== id)
}

function addTag(item: SuggestionItem) {
  const v = tagInput.value.trim()
  if (v && !item.roomTypes.includes(v)) item.roomTypes.push(v)
  tagInput.value = ""
}

function removeTag(item: SuggestionItem, i: number) {
  item.roomTypes.splice(i, 1)
}

function startDrag(i: number) {
  dragFrom.value = i
}

function overDrag(e: DragEvent, i: number) {
  e.preventDefault()
  dragOver.value = i
}

function leaveDrag() {
  dragOver.value = null
}

function endDrag() {
  dragFrom.value = null
  dragOver.value = null
}

function dropItem(to: number) {
  const from = dragFrom.value
  endDrag()
  if (from === null || from === to) return
  const list = [...items.value]
  const [moved] = list.splice(from, 1)
  if (!moved) return
  list.splice(to, 0, moved)
  items.value = list
}

function onSave() {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
  }, 600)
}

function onCancel() {
  greetingMessage.value = ""
  autoReplyMessage.value = ""
  items.value = []
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-gray-100">
    <header
      class="box-border flex h-20 w-full shrink-0 items-center gap-4 border-b border-gray-300 bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-gray-900">Chatbot Setup</h1>
    </header>

    <main
      class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16"
    >
      <article class="w-full rounded border border-gray-300 bg-white">
        <!-- Default Chatbot Messages -->
        <section class="flex flex-col gap-6 p-6 sm:p-10">
          <h2 class="headline-5 text-green-800">Default Chatbot Messages</h2>

          <form id="chatbot-form" class="flex flex-col gap-6" @submit.prevent="onSave">
            <fieldset class="flex flex-col gap-2">
              <label class="body-2 text-gray-800" for="cb-greeting">
                Greeting message <span class="text-gray-800">*</span>
              </label>
              <textarea
                id="cb-greeting"
                v-model="greetingMessage"
                rows="3"
                class="body-1 w-full resize-none rounded border border-gray-400 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-600 focus:border-gray-600"
                placeholder="Enter greeting message..."
              />
            </fieldset>

            <fieldset class="flex flex-col gap-2">
              <label class="body-2 text-gray-800" for="cb-auto-reply">
                Auto-reply message <span class="text-gray-800">*</span>
              </label>
              <textarea
                id="cb-auto-reply"
                v-model="autoReplyMessage"
                rows="3"
                class="body-1 w-full resize-none rounded border border-gray-400 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-600 focus:border-gray-600"
                placeholder="Enter auto-reply message..."
              />
            </fieldset>
          </form>
        </section>

        <hr class="border-gray-300" />

        <!-- Suggestion menu & Response -->
        <section class="flex flex-col gap-6 p-6 sm:p-10">
          <h2 class="headline-5 text-green-800">Suggestion menu &amp; Response</h2>

          <ul v-if="items.length" class="flex flex-col gap-4">
            <li
              v-for="(item, idx) in items"
              :key="item.id"
              draggable="true"
              class="rounded-lg border transition-shadow"
              :class="[
                dragOver === idx ? 'border-orange-400 shadow-md' : 'border-gray-300',
                dragFrom === idx ? 'opacity-40' : '',
              ]"
              @dragstart="startDrag(idx)"
              @dragover="overDrag($event, idx)"
              @dragleave="leaveDrag"
              @drop="dropItem(idx)"
              @dragend="endDrag"
            >
              <article class="flex items-start gap-3 p-4 sm:p-5">
                <div class="flex min-w-0 flex-1 flex-col gap-4">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
                    <fieldset class="flex min-w-0 flex-1 flex-col gap-1">
                      <span class="body-2 text-gray-800">
                        Topic <span class="text-orange-600">*</span>
                      </span>
                      <input
                        v-model="item.topic"
                        type="text"
                        :readonly="!item.editing"
                        class="body-1 h-10 w-full rounded border px-3 text-gray-900 outline-none"
                        :class="
                          item.editing
                            ? 'border-gray-400 focus:border-gray-600'
                            : 'border-gray-300 bg-gray-100'
                        "
                        placeholder="Enter topic"
                      />
                    </fieldset>

                    <fieldset class="flex w-full flex-col gap-1 sm:w-[200px]">
                      <span class="body-2 text-gray-800">Reply format</span>
                      <div class="relative">
                        <select
                          v-model="item.replyFormat"
                          :disabled="!item.editing"
                          class="body-1 h-10 w-full appearance-none rounded border px-3 pr-8 text-gray-900 outline-none"
                          :class="
                            item.editing
                              ? 'border-gray-400 focus:border-gray-600'
                              : 'border-gray-300 bg-gray-100'
                          "
                        >
                          <option value="" disabled>Select reply format</option>
                          <option
                            v-for="o in formatOptions"
                            :key="o.value"
                            :value="o.value"
                          >
                            {{ o.label }}
                          </option>
                        </select>
                        <ChevronDown
                          class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-600"
                          aria-hidden="true"
                        />
                      </div>
                    </fieldset>
                  </div>

                  <!-- editing: expanded fields -->
                  <template v-if="item.editing">
                    <fieldset class="flex flex-col gap-1">
                      <label :for="`rt-${item.id}`" class="body-2 text-gray-800">
                        Reply title
                      </label>
                      <input
                        :id="`rt-${item.id}`"
                        v-model="item.replyTitle"
                        type="text"
                        class="body-1 h-10 w-full rounded border border-gray-400 px-3 text-gray-900 outline-none focus:border-gray-600"
                        placeholder="Enter reply title"
                      />
                    </fieldset>

                    <fieldset
                      v-if="item.replyFormat === 'room_type'"
                      class="flex flex-col gap-1"
                    >
                      <span class="body-2 text-gray-800">Room type</span>
                      <div
                        class="flex flex-wrap items-center gap-2 rounded border border-gray-400 px-3 py-2"
                      >
                        <span
                          v-for="(t, ti) in item.roomTypes"
                          :key="ti"
                          class="body-2 inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-0.5 text-gray-900"
                        >
                          {{ t }}
                          <button
                            type="button"
                            class="text-gray-700 hover:text-red"
                            :aria-label="`Remove ${t}`"
                            @click="removeTag(item, ti)"
                          >
                            <X class="size-3.5" aria-hidden="true" />
                          </button>
                        </span>
                        <input
                          v-model="tagInput"
                          type="text"
                          class="body-1 min-w-[100px] flex-1 border-0 bg-transparent p-0 outline-none placeholder:text-gray-600"
                          placeholder="Type & Enter..."
                          @keydown.enter.prevent="addTag(item)"
                        />
                      </div>
                    </fieldset>

                    <fieldset class="flex flex-col gap-1">
                      <label :for="`bn-${item.id}`" class="body-2 text-gray-800">
                        Button name
                      </label>
                      <input
                        :id="`bn-${item.id}`"
                        v-model="item.buttonName"
                        type="text"
                        class="body-1 h-10 w-full rounded border border-gray-400 px-3 text-gray-900 outline-none focus:border-gray-600"
                        placeholder="Enter button name"
                      />
                    </fieldset>
                  </template>

                  <!-- collapsed preview -->
                  <template v-else>
                    <p v-if="item.replyTitle" class="body-1 text-gray-700">
                      {{ item.replyTitle }}
                    </p>
                    <div
                      v-if="item.replyFormat === 'room_type' && item.roomTypes.length"
                      class="flex flex-wrap gap-2"
                    >
                      <span
                        v-for="(t, ti) in item.roomTypes"
                        :key="ti"
                        class="body-2 rounded-full bg-gray-200 px-3 py-0.5 text-gray-900"
                      >
                        {{ t }}
                      </span>
                    </div>
                    <p v-if="item.buttonName" class="body-2 text-gray-600">
                      Button: {{ item.buttonName }}
                    </p>
                  </template>
                </div>

                <!-- action buttons -->
                <nav class="flex shrink-0 items-start gap-0.5" aria-label="Card actions">
                  <button
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    :aria-label="item.editing ? 'Finish editing' : 'Edit'"
                    @click="item.editing = !item.editing"
                  >
                    <Pencil class="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded text-gray-600 hover:bg-red/10 hover:text-red"
                    aria-label="Delete"
                    @click="removeItem(item.id)"
                  >
                    <Trash2 class="size-4" aria-hidden="true" />
                  </button>
                  <span
                    class="inline-flex size-8 cursor-grab items-center justify-center text-gray-500 active:cursor-grabbing"
                    aria-label="Drag to reorder"
                  >
                    <GripVertical class="size-5" aria-hidden="true" />
                  </span>
                </nav>
              </article>
            </li>
          </ul>

          <p v-else class="body-1 py-4 text-center text-gray-600">
            No suggestion menu items yet.
          </p>

          <button
            type="button"
            class="body-1 inline-flex w-fit items-center gap-2 font-semibold text-orange-600 hover:text-orange-500"
            @click="addItem"
          >
            <Plus class="size-4" aria-hidden="true" />
            Add Suggestion menu
          </button>
        </section>
      </article>

      <footer class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          form="chatbot-form"
          class="inline-flex h-12 items-center justify-center rounded bg-orange-600 px-8 text-base font-semibold text-white hover:bg-orange-500 active:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500"
          :disabled="isSaving"
        >
          {{ isSaving ? "Saving..." : "Save" }}
        </button>
        <button
          type="button"
          class="body-1 inline-flex h-12 items-center justify-center px-4 font-semibold text-gray-700 hover:text-gray-900"
          @click="onCancel"
        >
          Cancel
        </button>
      </footer>
    </main>
  </section>
</template>
