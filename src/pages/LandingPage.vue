<script setup lang="ts">
import Brand from '@/shared/ui/Brand.vue'
import TowerArtwork from '@/shared/ui/TowerArtwork.vue'
import StatusSymbol from '@/shared/ui/StatusSymbol.vue'
const protocols = [
  ['ICMP', 'A simple ping.', 'Know whether your host is reachable.'],
  ['TCP', 'An open door.', 'Check that the port accepts connections.'],
  ['HTTP', 'The right response.', 'Keep an eye on status codes and latency.'],
  ['HTTPS', 'A secure connection.', 'Watch your endpoint and TLS certificate.'],
]
const states = [
  { status: 'UP', title: 'Up', text: 'Checks are passing.' },
  { status: 'DOWN', title: 'Down', text: 'The target is not responding.' },
  { status: 'UNKNOWN', title: 'Unknown', text: 'Waiting for a confirmed result.' },
] as const
</script>
<template>
  <div class="landing">
    <header class="app-header">
      <Brand />
      <div class="flex gap-3">
        <RouterLink to="/login" class="btn btn-ghost btn-sm">Log in</RouterLink
        ><RouterLink to="/register" class="btn btn-sm">Get started ↗</RouterLink>
      </div>
    </header>
    <main>
      <section class="landing-hero">
        <p class="eyebrow">Uptime monitoring / HTTP · HTTPS · TCP · ICMP</p>
        <h1>Know what’s up.<br />Get on with life.</h1>
        <div class="mt-10 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p class="max-w-md text-xl text-muted">
              Four protocols, one verdict. Quiet, black and white, and honest about what it knows.
            </p>
            <RouterLink to="/register" class="btn mt-8">Start monitoring ↗</RouterLink>
            <p class="mt-4 font-mono text-xs text-muted">
              One alert when it breaks. One when it’s back.
            </p>
          </div>
          <TowerArtwork />
        </div>
      </section>
      <section class="landing-section">
        <p class="eyebrow">01 / The checks</p>
        <h2 class="my-6">Four ways to ask,<br />“Are you there?”</h2>
        <div class="protocol-grid mt-10">
          <article v-for="[tag, title, description] in protocols" :key="tag">
            <span class="eyebrow">{{ tag }}</span>
            <h3>{{ title }}</h3>
            <p class="text-sm text-muted">{{ description }}</p>
          </article>
        </div>
      </section>
      <section class="landing-section grid gap-12 md:grid-cols-2">
        <div>
          <p class="eyebrow">02 / The verdict</p>
          <h2 class="mt-6">A state you can read.<br />Even without color.</h2>
          <p class="mt-5 max-w-sm text-muted">
            See the current state, inspect recent checks, and decide when a notification should
            reach you.
          </p>
        </div>
        <div class="flex flex-col justify-center">
          <div
            v-for="state in states"
            :key="state.status"
            class="flex items-center gap-5 border-t border-line py-6"
          >
            <StatusSymbol :status="state.status" /><span class="w-20 font-semibold">{{
              state.title
            }}</span
            ><span class="text-sm text-muted">{{ state.text }}</span>
          </div>
        </div>
      </section>
      <section class="landing-section flex flex-wrap items-end justify-between gap-8">
        <div>
          <p class="eyebrow">A little peace of mind</p>
          <h2 class="mt-6">Let us keep watch.</h2>
        </div>
        <RouterLink to="/register" class="btn">Create your account ↗</RouterLink>
      </section>
    </main>
    <footer class="app-footer">
      <Brand /><span>Four protocols. One clear picture.</span
      ><RouterLink to="/login">Log in ↗</RouterLink>
    </footer>
  </div>
</template>
