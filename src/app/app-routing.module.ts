import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { WatchlistComponent } from './features/watchlist/watchlist.component';
import { RatingComponent } from './features/rating/rating.component';
import { HistoryComponent } from './features/history/history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [AuthGuard] },
  { path: 'ratings', component: RatingComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'reviews', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // ← scrollt beim Route-Change nach oben
    anchorScrolling: 'enabled',          // ← optional, falls du #anker benutzt
  }),],
  exports: [RouterModule],
})
export class AppRoutingModule {}