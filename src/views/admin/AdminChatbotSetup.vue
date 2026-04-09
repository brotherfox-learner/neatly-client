<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue"
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-vue-next"
import { api } from "@/lib/api"

interface ChatbotDefaults {
  greeting: string
  autoReply: string
}

interface FaqPresetRow {
  id: string
  question: string
  answer: string
  keywords: string[]
  active: boolean
  category: string
  sortOrder: number
  responseType: string
}

interface FaqWriteBody {
  question: string
  answer: string
  keywords: string[]
  responseType: string
  sortOrder: number
  active: boolean
}

const responseTypeOptions: { value: string; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "room_cards", label: "Room cards" },
  { value: "options", label: "Payment options" },
  { value: "promotion_cards", label: "Promotions" },
]

const greetingMessage = ref("")
const autoReplyMessage = ref("")
const presets = ref<FaqPresetRow[]>([])
const tableFilter = ref("")
const loadError = ref<string | null>(null)
const isLoading = ref(false)
const isSavingSettings = ref(false)
const isSavingPreset = ref(false)
const isDeletingId = ref<string | null>(null)

const showPresetForm = ref(false)
const presetFormPanel = ref<HTMLElement | null>(null)
const keywordDraftInput = ref("")
const editingId = ref<string | null>(null)
const form = ref<FaqWriteBody>({
  question: "",
  answer: "",
  keywords: [],
  responseType: "text",
  sortOrder: 0,
  active: true,
})

const filteredPresets = computed(() => {
  const q = tableFilter.value.trim().toLowerCase()
  if (!q) return presets.value
  return presets.value.filter((row) => {
    const inTopic = row.question.toLowerCase().includes(q)
    const inKw = row.keywords.some((k) => k.toLowerCase().includes(q))
    const inAnswer = row.answer.toLowerCase().includes(q)
    return inTopic || inKw || inAnswer
  })
})

function labelForResponseType(value: string) {
  return responseTypeOptions.find((o) => o.value === value)?.label ?? value
}

async function loadAll() {
  loadError.value = null
  isLoading.value = true
  try {
    const [settingsRes, presetsRes] = await Promise.all([
      api.get<ChatbotDefaults>("/api/v1/admin/chatbot/settings"),
      api.get<FaqPresetRow[]>("/api/v1/admin/chatbot/presets"),
    ])
    greetingMessage.value = settingsRes.data.greeting ?? ""
    autoReplyMessage.value = settingsRes.data.autoReply ?? ""
    presets.value = presetsRes.data
  } catch (e) {
    console.error(e)
    loadError.value =
      "Could not load data. Check admin login and that the backend is running."
  } finally {
    isLoading.value = false
  }
}

async function saveSettings() {
  isSavingSettings.value = true
  loadError.value = null
  try {
    await api.put("/api/v1/admin/chatbot/settings", {
      greeting: greetingMessage.value,
      autoReply: autoReplyMessage.value,
    })
  } catch (e) {
    console.error(e)
    loadError.value = "Could not save default messages."
  } finally {
    isSavingSettings.value = false
  }
}

function scrollPresetFormIntoView() {
  requestAnimationFrame(() => {
    presetFormPanel.value?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  })
}

async function openCreateForm() {
  editingId.value = null
  const nextOrder =
    presets.value.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0) + 1
  form.value = {
    question: "",
    answer: "",
    keywords: [],
    responseType: "text",
    sortOrder: nextOrder,
    active: true,
  }
  keywordDraftInput.value = ""
  showPresetForm.value = true
  await nextTick()
  scrollPresetFormIntoView()
}

async function openEditForm(row: FaqPresetRow) {
  editingId.value = row.id
  form.value = {
    question: row.question,
    answer: row.answer,
    keywords: [...row.keywords],
    responseType: row.responseType,
    sortOrder: row.sortOrder,
    active: row.active,
  }
  keywordDraftInput.value = ""
  showPresetForm.value = true
  await nextTick()
  scrollPresetFormIntoView()
}

function closePresetForm() {
  showPresetForm.value = false
  editingId.value = null
  keywordDraftInput.value = ""
}

function addKeywordTag() {
  const v = keywordDraftInput.value.trim().toLowerCase()
  if (v && !form.value.keywords.includes(v)) form.value.keywords.push(v)
  keywordDraftInput.value = ""
}

function removeKeywordTag(i: number) {
  form.value.keywords.splice(i, 1)
}

async function savePreset() {
  if (!form.value.question.trim()) {
    loadError.value = "Please enter a topic."
    return
  }
  isSavingPreset.value = true
  loadError.value = null
  try {
    const body: FaqWriteBody = {
      question: form.value.question.trim(),
      answer: form.value.answer,
      keywords: [...form.value.keywords],
      responseType: form.value.responseType,
      sortOrder: form.value.sortOrder,
      active: form.value.active,
    }
    if (editingId.value) {
      await api.put(`/api/v1/admin/chatbot/presets/${editingId.value}`, body)
    } else {
      await api.post("/api/v1/admin/chatbot/presets", body)
    }
    closePresetForm()
    await loadAll()
  } catch (e) {
    console.error(e)
    loadError.value = "Could not save preset."
  } finally {
    isSavingPreset.value = false
  }
}

async function deletePreset(id: string) {
  if (!window.confirm("Remove this topic from the chatbot?")) return
  isDeletingId.value = id
  loadError.value = null
  try {
    await api.delete(`/api/v1/admin/chatbot/presets/${id}`)
    if (editingId.value === id) closePresetForm()
    await loadAll()
  } catch (e) {
    console.error(e)
    loadError.value = "Could not delete preset."
  } finally {
    isDeletingId.value = null
  }
}

onMounted(() => {
  void loadAll()
})
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-gray-100">
    <header
      class="box-border flex h-20 w-full shrink-0 flex-wrap items-center gap-4 border-b border-gray-300 bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-gray-900">Chatbot Setup</h1>
      <button
        type="button"
        class="body-2 inline-flex items-center gap-2 rounded border border-gray-400 px-4 py-2 font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        :disabled="isLoading"
        @click="loadAll"
      >
        <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" aria-hidden="true" />
        Refresh
      </button>
    </header>

    <main
      class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-10 lg:pb-16"
    >
      <p
        v-if="loadError"
        class="body-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800"
        role="alert"
      >
        {{ loadError }}
      </p>

      <article class="rounded border border-gray-300 bg-white p-6 sm:p-8">
        <h2 class="headline-5 text-green-800">Default messages</h2>
        <p class="body-2 mt-2 text-gray-600">
          Shown when the chat opens and for automated closing copy (stored in the database).
        </p>
        <form class="mt-6 flex flex-col gap-5" @submit.prevent="saveSettings">
          <fieldset class="flex flex-col gap-2">
            <label class="body-2 text-gray-800" for="dash-greeting">Greeting message</label>
            <textarea
              id="dash-greeting"
              v-model="greetingMessage"
              rows="3"
              class="body-1 w-full resize-none rounded border border-gray-400 px-4 py-3 text-gray-900 outline-none focus:border-gray-600"
            />
          </fieldset>
          <fieldset class="flex flex-col gap-2">
            <label class="body-2 text-gray-800" for="dash-auto">Auto-reply message</label>
            <textarea
              id="dash-auto"
              v-model="autoReplyMessage"
              rows="3"
              class="body-1 w-full resize-none rounded border border-gray-400 px-4 py-3 text-gray-900 outline-none focus:border-gray-600"
            />
          </fieldset>
          <div>
            <button
              type="submit"
              class="inline-flex h-11 items-center justify-center rounded bg-orange-600 px-6 text-base font-semibold text-white hover:bg-orange-500 disabled:bg-gray-300"
              :disabled="isSavingSettings || isLoading"
            >
              {{ isSavingSettings ? "Saving…" : "Save default messages" }}
            </button>
          </div>
        </form>
      </article>

      <article class="rounded border border-gray-300 bg-white p-6 sm:p-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="headline-5 text-green-800">Suggestion topics &amp; answers (presets)</h2>
            <p class="body-2 mt-2 text-gray-600">
              Manage chat button labels, replies, and keywords for free-text matching.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded bg-orange-600 px-5 text-base font-semibold text-white hover:bg-orange-500"
            @click="openCreateForm"
          >
            <Plus class="size-4" aria-hidden="true" />
            Add topic
          </button>
        </div>

        <section
          v-if="showPresetForm"
          id="preset-form-panel"
          ref="presetFormPanel"
          class="mt-6 rounded-lg border-2 border-orange-200 bg-orange-50/50 p-5 sm:p-6"
          aria-labelledby="preset-form-title"
        >
          <header class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h3 id="preset-form-title" class="headline-5 text-gray-900">
              {{ editingId ? "Edit topic" : "New topic" }}
            </h3>
            <button
              type="button"
              class="body-2 inline-flex items-center gap-1 rounded border border-gray-400 bg-white px-3 py-1.5 font-medium text-gray-800 hover:bg-gray-50"
              @click="closePresetForm"
            >
              <X class="size-4" aria-hidden="true" />
              Close
            </button>
          </header>

          <form class="flex flex-col gap-4" @submit.prevent="savePreset">
            <fieldset class="flex flex-col gap-1">
              <label class="body-2 text-gray-800" for="fm-topic">
                Topic <span class="text-orange-600">*</span>
              </label>
              <input
                id="fm-topic"
                v-model="form.question"
                type="text"
                required
                class="body-1 h-10 w-full rounded border border-gray-400 bg-white px-3 text-gray-900 outline-none focus:border-gray-600"
              />
            </fieldset>

            <fieldset class="flex flex-col gap-1">
              <label class="body-2 text-gray-800" for="fm-answer">
                Reply text (intro / description)
              </label>
              <textarea
                id="fm-answer"
                v-model="form.answer"
                rows="4"
                class="body-1 w-full resize-none rounded border border-gray-400 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-600"
              />
            </fieldset>

            <fieldset class="flex flex-col gap-1">
              <span class="body-2 text-gray-800">Keywords (free-text search)</span>
              <div
                class="flex flex-wrap items-center gap-2 rounded border border-gray-400 bg-white px-3 py-2"
              >
                <span
                  v-for="(kw, ki) in form.keywords"
                  :key="ki"
                  class="body-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-gray-900"
                >
                  {{ kw }}
                  <button
                    type="button"
                    class="text-gray-700 hover:text-red-700"
                    :aria-label="`Remove keyword ${kw}`"
                    @click="removeKeywordTag(ki)"
                  >
                    <X class="size-3.5" aria-hidden="true" />
                  </button>
                </span>
                <input
                  v-model="keywordDraftInput"
                  type="text"
                  class="body-1 min-w-[140px] flex-1 border-0 bg-transparent p-0 outline-none placeholder:text-gray-500"
                  placeholder="Type and press Enter"
                  @keydown.enter.prevent="addKeywordTag"
                />
              </div>
            </fieldset>

            <fieldset class="flex flex-col gap-1">
              <label class="body-2 text-gray-800" for="fm-type">Response type</label>
              <select
                id="fm-type"
                v-model="form.responseType"
                class="body-1 h-10 w-full rounded border border-gray-400 bg-white px-3 text-gray-900 outline-none focus:border-gray-600"
              >
                <option v-for="o in responseTypeOptions" :key="o.value" :value="o.value">
                  {{ o.label }}
                </option>
              </select>
            </fieldset>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
              <fieldset class="flex flex-1 flex-col gap-1">
                <label class="body-2 text-gray-800" for="fm-order">Display order</label>
                <input
                  id="fm-order"
                  v-model.number="form.sortOrder"
                  type="number"
                  min="0"
                  class="body-1 h-10 w-full rounded border border-gray-400 bg-white px-3 text-gray-900 outline-none focus:border-gray-600"
                />
              </fieldset>
              <fieldset class="flex items-center gap-2 pb-2 sm:pb-0">
                <input
                  id="fm-active"
                  v-model="form.active"
                  type="checkbox"
                  class="size-4 rounded border-gray-400"
                />
                <label class="body-2 text-gray-800" for="fm-active">Visible in chatbot</label>
              </fieldset>
            </div>

            <footer class="flex flex-wrap gap-3 border-t border-orange-200/80 pt-4">
              <button
                type="submit"
                class="inline-flex h-11 items-center justify-center rounded bg-orange-600 px-6 font-semibold text-white hover:bg-orange-500 disabled:bg-gray-300"
                :disabled="isSavingPreset"
              >
                {{ isSavingPreset ? "Saving…" : "Save" }}
              </button>
              <button
                type="button"
                class="body-2 inline-flex h-11 items-center justify-center px-4 font-semibold text-gray-700 hover:text-gray-900"
                @click="closePresetForm"
              >
                Cancel
              </button>
            </footer>
          </form>
        </section>

        <div class="relative mt-6 max-w-md">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            v-model="tableFilter"
            type="search"
            class="body-1 h-10 w-full rounded border border-gray-400 py-2 pl-10 pr-3 text-gray-900 outline-none focus:border-gray-600"
            placeholder="Search by topic, keywords, or answer text…"
            aria-label="Filter presets"
          />
        </div>

        <div class="mt-4 overflow-x-auto rounded border border-gray-200">
          <table class="min-w-[720px] w-full border-collapse text-left">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="body-2 whitespace-nowrap px-4 py-3 font-semibold text-gray-800">Order</th>
                <th class="body-2 whitespace-nowrap px-4 py-3 font-semibold text-gray-800">Topic</th>
                <th class="body-2 min-w-[180px] px-4 py-3 font-semibold text-gray-800">Keywords</th>
                <th class="body-2 whitespace-nowrap px-4 py-3 font-semibold text-gray-800">
                  Response type
                </th>
                <th class="body-2 whitespace-nowrap px-4 py-3 font-semibold text-gray-800">Active</th>
                <th class="body-2 whitespace-nowrap px-4 py-3 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading && !presets.length">
                <td colspan="6" class="body-1 px-4 py-10 text-center text-gray-600">Loading…</td>
              </tr>
              <tr v-else-if="!filteredPresets.length">
                <td colspan="6" class="body-1 px-4 py-10 text-center text-gray-600">
                  {{
                    presets.length
                      ? "No rows match your search."
                      : "No presets yet (category = preset in the database). Click “Add topic” to create one."
                  }}
                </td>
              </tr>
              <tr
                v-for="row in filteredPresets"
                v-else
                :key="row.id"
                class="border-b border-gray-100 hover:bg-gray-50/80"
              >
                <td class="body-1 whitespace-nowrap px-4 py-3 text-gray-800">{{ row.sortOrder }}</td>
                <td class="body-1 max-w-[220px] px-4 py-3 text-gray-900">
                  <span class="line-clamp-2">{{ row.question }}</span>
                </td>
                <td class="body-2 px-4 py-3 text-gray-700">
                  <span v-if="!row.keywords.length" class="text-gray-500">—</span>
                  <span v-else class="line-clamp-2">{{ row.keywords.join(", ") }}</span>
                </td>
                <td class="body-2 whitespace-nowrap px-4 py-3 text-gray-800">
                  {{ labelForResponseType(row.responseType) }}
                </td>
                <td class="body-2 px-4 py-3">
                  <span
                    class="inline-block rounded-full px-2.5 py-0.5 font-medium"
                    :class="row.active ? 'bg-green-100 text-green-900' : 'bg-gray-200 text-gray-600'"
                  >
                    {{ row.active ? "On" : "Off" }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="inline-flex size-9 items-center justify-center rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      aria-label="Edit"
                      @click="openEditForm(row)"
                    >
                      <Pencil class="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex size-9 items-center justify-center rounded text-gray-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                      aria-label="Delete"
                      :disabled="isDeletingId === row.id"
                      @click="deletePreset(row.id)"
                    >
                      <Trash2 class="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </main>
  </section>
</template>
