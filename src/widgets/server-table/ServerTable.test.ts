import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { screen, fireEvent, waitFor, within } from '@testing-library/vue'
import ServerTable from './ServerTable.vue'
import { renderApp } from '@/test/render'
import { servers, ok } from '@/test/fixtures'
const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(ok(servers))
})
afterEach(() => vi.unstubAllGlobals())
it('combines name/host search, status and protocol filters', async () => {
  await renderApp(ServerTable)
  await screen.findByRole('link', { name: 'Mail ↗' })
  await fireEvent.update(screen.getByLabelText('Search monitors'), 'MAIL.EXAMPLE')
  expect(screen.getByRole('link', { name: 'Mail ↗' })).toBeVisible()
  expect(screen.queryByRole('link', { name: 'Production API ↗' })).not.toBeInTheDocument()
  await fireEvent.update(screen.getByLabelText('Search monitors'), '')
  await fireEvent.update(screen.getByLabelText('Filter by status'), 'UP')
  await fireEvent.update(screen.getByLabelText('Filter by protocol'), 'TCP')
  expect(screen.getByText(/No monitors match/)).toBeVisible()
  await fireEvent.update(screen.getByLabelText('Filter by status'), 'paused')
  await fireEvent.update(screen.getByLabelText('Filter by protocol'), 'ICMP')
  expect(screen.getByRole('link', { name: 'Router ↗' })).toBeVisible()
})
it('requires confirmation and retains the dialog when deletion fails', async () => {
  fetchMock.mockImplementation(async (_url, init) =>
    init?.method === 'DELETE'
      ? new Response('{"message":"Try later"}', { status: 500 })
      : ok(servers),
  )
  await renderApp(ServerTable)
  await fireEvent.click(await screen.findByRole('button', { name: 'Delete Mail' }))
  expect(fetchMock.mock.calls.some(([, i]) => i?.method === 'DELETE')).toBe(false)
  await fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete monitor' }),
  )
  expect(await screen.findByRole('alert')).toHaveTextContent('Try later')
})
it('deletes only after confirmation and closes the dialog on success', async () => {
  fetchMock.mockImplementation(async (_url, init) =>
    init?.method === 'DELETE' ? new Response(null, { status: 204 }) : ok(servers),
  )
  await renderApp(ServerTable)
  await fireEvent.click(await screen.findByRole('button', { name: 'Delete Mail' }))
  await fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete monitor' }),
  )
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(
    fetchMock.mock.calls.some(
      ([url, init]) => url === '/api/servers/s2' && init?.method === 'DELETE',
    ),
  ).toBe(true)
})
it('offers an empty-state action and a separate failure state with retry', async () => {
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 })).mockResolvedValue(ok([]))
  const add = vi.fn()
  await renderApp(ServerTable, { onAdd: add })
  await screen.findByRole('alert')
  expect(screen.queryByText('Nothing to watch. Yet.')).not.toBeInTheDocument()
  await fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await fireEvent.click(await screen.findByRole('button', { name: '+ Add your first monitor' }))
  expect(add).toHaveBeenCalledOnce()
})
