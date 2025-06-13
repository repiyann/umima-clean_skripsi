/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'

import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { hydrate, mount } from 'svelte'
import AppLayout from '~/lib/components/template/app-layout.svelte'

createInertiaApp({
  progress: { color: '#5468FF' },

  resolve: async (name): Promise<ResolvedComponent> => {
    const pages = await resolvePageComponent<ResolvedComponent>(
      `../pages/${name}.svelte`,
      import.meta.glob<ResolvedComponent>('../pages/**/*.svelte')
    )

    const page = {
      default: pages.default,
      layout: pages.layout || AppLayout,
    } as ResolvedComponent

    return page
  },

  setup({ el, App, props }) {
    if (!el) throw new Error('Missing root element. Make sure to add a div#app to your page')

    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el, props })
    } else {
      mount(App, { target: el, props })
    }
  },
})
