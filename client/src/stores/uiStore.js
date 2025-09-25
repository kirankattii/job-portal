import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { THEMES, STORAGE_KEYS } from '@/constants'

const useUIStore = create(
  devtools(persist(
    (set, get) => ({
      theme: localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.SYSTEM,
      isOnline: navigator.onLine,
      modals: {},
      notifications: [],

      setTheme: (theme) => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme)
        set({ theme })
      },

      openModal: (key, data) => set((s) => ({ modals: { ...s.modals, [key]: { open: true, data } } })),
      closeModal: (key) => set((s) => ({ modals: { ...s.modals, [key]: { open: false, data: null } } })),

      pushNotification: (notification) => set((s) => ({ notifications: [...s.notifications, { id: crypto.randomUUID(), ...notification }] })),
      removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      monitorNetwork: () => {
        const update = () => set({ isOnline: navigator.onLine })
        window.addEventListener('online', update)
        window.addEventListener('offline', update)
        return () => {
          window.removeEventListener('online', update)
          window.removeEventListener('offline', update)
        }
      },
    }),
    { name: 'ui-storage', partialize: (s) => ({ theme: s.theme }) }
  ))
)

export default useUIStore


