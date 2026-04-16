import { computed, ref, watch, type ComputedRef, type Ref } from "vue"

export const ADMIN_TABLE_PAGE_SIZE = 8

/**
 * Client-side pagination over an already-filtered list.
 * Resets to page 1 when any `resetTriggers` ref changes (e.g. search text).
 */
export function usePagedList<T>(list: ComputedRef<T[]>, resetTriggers: Ref<unknown>[]) {
  const currentPage = ref(1)

  const totalItems = computed(() => list.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / ADMIN_TABLE_PAGE_SIZE)))

  const pagedItems = computed(() => {
    const arr = list.value
    const start = (currentPage.value - 1) * ADMIN_TABLE_PAGE_SIZE
    return arr.slice(start, start + ADMIN_TABLE_PAGE_SIZE)
  })

  function setPage(n: number) {
    const tp = totalPages.value
    currentPage.value = Math.min(Math.max(1, Math.floor(n)), tp)
  }

  watch(totalPages, (tp) => {
    if (currentPage.value > tp) currentPage.value = tp
    if (currentPage.value < 1) currentPage.value = 1
  })

  for (const trigger of resetTriggers) {
    watch(trigger, () => {
      currentPage.value = 1
    })
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    pagedItems,
    setPage,
    pageSize: ADMIN_TABLE_PAGE_SIZE,
  }
}
