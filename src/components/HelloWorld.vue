<script setup lang="ts">
import { Button } from "@/components/ui"
</script>

<template>
  <article class="space-y-8">
    <section class="space-y-4" aria-label="Typography preview">
      <header>
        <p class="body-3 text-muted-foreground">Typography</p>
      </header>

      <section class="space-y-2" aria-label="Headline font compare">
        <header>
          <p class="body-3 text-muted-foreground">Headline Font Test (Noto Serif vs Inter)</p>
        </header>
        <h1 class="headline-1 font-noto-serif">Headline1 - Noto Serif</h1>
        <h1 class="headline-1 font-inter">Headline1 - Inter</h1>
      </section>

      <h2 class="headline-2">Headline2</h2>
      <h3 class="headline-3">Headline3</h3>
      <h4 class="headline-4">Headline4</h4>
      <h5 class="headline-5">Headline5</h5>
      <p class="body-1">Body1</p>
      <p class="body-2">Body2</p>
      <p class="body-3">Body3</p>
    </section>

    <section class="space-y-4" aria-label="Button preview">
      <header>
        <p class="body-3 text-muted-foreground">Buttons</p>
      </header>

      <section class="flex flex-wrap gap-4" aria-label="Primary buttons">
        <Button variant="primary">Primary</Button>
        <Button variant="primary" class="opacity-80">Primary</Button>
        <Button variant="primary" disabled>Primary</Button>
      </section>

      <section class="flex flex-wrap gap-4" aria-label="Secondary buttons">
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary" class="opacity-80">Secondary</Button>
        <Button variant="secondary" disabled>Secondary</Button>
      </section>

      <section class="flex flex-wrap gap-4" aria-label="Ghost buttons">
        <Button variant="ghost">Ghost -></Button>
        <Button variant="ghost" class="opacity-80">Ghost -></Button>
        <Button variant="ghost" disabled>Ghost -></Button>
      </section>
    </section>
  </article>
</template>
