import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/vue'
import ServerDialog from './ServerDialog.vue'
import { renderApp } from '@/test/render'
import { ok, servers } from '@/test/fixtures'
const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(ok(servers[0]))
})
afterEach(() => vi.unstubAllGlobals())
it('validates required fields before making a request', async () => {
  await renderApp(ServerDialog, { open: true })
  await fireEvent.click(screen.getByRole('button', { name: 'Add' }))
  expect(await screen.findByText('Name is required')).toBeVisible()
  expect(screen.getByText('Host is required')).toBeVisible()
  expect(fetchMock).not.toHaveBeenCalled()
})
it('creates ICMP targets without a port input or query', async () => {
  const close = vi.fn()
  await renderApp(ServerDialog, { open: true, onClose: close })
  await fireEvent.update(screen.getByLabelText('Name'), 'Gateway')
  await fireEvent.update(screen.getByLabelText('Host'), '10.0.0.1')
  await fireEvent.update(screen.getByLabelText('Protocol'), 'ICMP')
  expect(screen.queryByLabelText('Port')).not.toBeInTheDocument()
  await fireEvent.click(screen.getByRole('button', { name: 'Add' }))
  await waitFor(() => expect(close).toHaveBeenCalled())
  expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
    name: 'Gateway',
    host: '10.0.0.1',
    port: 1,
    protocol: 'ICMP',
  })
})
it('updates a target and retains form values on an API error', async () => {
  fetchMock.mockResolvedValue(new Response('{"message":"Host is not allowed"}', { status: 400 }))
  await renderApp(ServerDialog, { open: true, editing: servers[0] })
  expect(screen.getByLabelText('Port')).toHaveValue(443)
  await fireEvent.update(screen.getByLabelText('Name'), 'Renamed')
  await fireEvent.click(screen.getByRole('button', { name: 'Update' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Host is not allowed')
  expect(fetchMock.mock.calls[0][1]?.method).toBe('PUT')
  expect(screen.getByLabelText('Name')).toHaveValue('Renamed')
})
