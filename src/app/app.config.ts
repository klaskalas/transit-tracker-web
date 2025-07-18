import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideMapboxGL} from 'ngx-mapbox-gl';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideMapboxGL({
      accessToken: 'pk.eyJ1Ijoia2xhc2thbGFzIiwiYSI6ImNtY3dpNHU5bjAyZnEybXM1cjhwYTZhbzcifQ.S780ylDojDzuzuhf_uhaUA',
      // optional:
      //geocoderAccessToken: 'your-mapbox-token-here'
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
