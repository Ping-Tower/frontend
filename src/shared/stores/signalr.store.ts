import { create } from 'zustand'
import type { HubConnection } from '@microsoft/signalr'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface SignalRStore {
  connection: HubConnection | null
  status: ConnectionStatus
  setConnection: (conn: HubConnection | null) => void
  setStatus: (status: ConnectionStatus) => void
}

export const useSignalRStore = create<SignalRStore>((set) => ({
  connection: null,
  status: 'disconnected',
  setConnection: (connection) => set({ connection }),
  setStatus: (status) => set({ status }),
}))
