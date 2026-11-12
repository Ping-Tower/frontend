<script setup lang="ts">
import { ref } from 'vue'
import { useTelegram, useConnectTelegram, useRemoveTelegram } from '@/features/account/queries'
import type { TelegramAccount } from '@/entities'
import Feedback from '@/shared/ui/Feedback.vue'
import Modal from '@/shared/ui/Modal.vue'
import TelegramLogin from '@/features/account/TelegramLogin.vue'
const { data: accounts, isPending, isError, refetch } = useTelegram(),
  connect = useConnectTelegram(),
  remove = useRemoveTelegram()
const removing = ref<TelegramAccount | null>(null)
function handle(account: TelegramAccount) {
  return account.username ? `@${account.username}` : `ID ${account.telegramUserId}`
}
function requestRemove(account: TelegramAccount) {
  removing.value = account
  remove.reset()
}
function confirm() {
  if (removing.value)
    remove.mutate(removing.value.id, {
      onSuccess: () => {
        removing.value = null
      },
    })
}
</script>
<template>
  <div class="page-content max-w-3xl">
    <div>
      <p class="eyebrow mb-4">Keep the right people in the loop</p>
      <h1 class="page-title">Integrations</h1>
      <p class="mt-4 text-muted">Connect the places where you want to hear from us.</p>
    </div>
    <Feedback v-if="isError" @retry="refetch()" />
    <div v-else-if="isPending" class="skeleton h-64" />
    <section v-else class="card">
      <h2 class="section-title">Telegram accounts</h2>
      <p v-if="!accounts?.length" class="my-8 text-muted">
        No Telegram accounts linked. Connect one to receive notifications.
      </p>
      <div
        v-for="account in accounts"
        :key="account.id"
        class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line py-5"
      >
        <div>
          <p class="font-medium">{{ handle(account) }}</p>
          <p class="mt-1 font-mono text-xs text-muted">
            Connected {{ new Date(account.createdAt).toLocaleDateString() }}
          </p>
        </div>
        <button class="btn btn-outline btn-sm" @click="requestRemove(account)">Remove</button>
      </div>
      <div class="mt-6 border-t border-line pt-6">
        <p class="mb-5 text-sm">Connect a Telegram account to receive server alerts:</p>
        <TelegramLogin @auth="connect.mutate($event)" />
        <p v-if="connect.error.value" role="alert" class="field-error mt-4">
          {{ connect.error.value.message }}
        </p>
        <p v-if="connect.isPending.value" role="status" class="mt-4 text-sm">Connecting…</p>
      </div>
    </section>
    <Modal
      :open="!!removing"
      title="Remove Telegram account?"
      :description="`Remove ${removing ? handle(removing) : 'this account'}? Alerts will no longer reach it.`"
      :busy="remove.isPending.value"
      @close="removing = null"
      ><p v-if="remove.error.value" role="alert" class="field-error mt-4">
        {{ remove.error.value.message }}
      </p>
      <div class="mt-7 flex justify-end gap-3">
        <button class="btn btn-ghost" :disabled="remove.isPending.value" @click="removing = null">
          Cancel</button
        ><button class="btn" :disabled="remove.isPending.value" @click="confirm">
          {{ remove.isPending.value ? 'Removing…' : 'Remove account' }}
        </button>
      </div></Modal
    >
  </div>
</template>
