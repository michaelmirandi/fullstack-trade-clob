"use client"

import { useSyncExternalStore } from "react"

const MOBILE_QUERY = "(max-width: 639px)"
const MOBILE_LEVELS = 14
const DESKTOP_LEVELS = 11

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {}
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches ? MOBILE_LEVELS : DESKTOP_LEVELS
}

function getServerSnapshot() {
  return DESKTOP_LEVELS
}

export function useMaxLevels() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
