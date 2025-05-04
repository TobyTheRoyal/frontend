import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations'; // Falls Animationen genutzt werden
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), // Optional, falls du Material nutzt
    importProvidersFrom(ReactiveFormsModule, FormsModule), // Für FormBuilder
  ],
})
.catch(err => console.error(err));