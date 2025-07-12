import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { ContentService } from '../../core/services/content.service';
import { FilterOptions } from '../../core/services/filter.service';
import { debugError } from '../../core/utils/logger';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-filter-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSliderModule],
  templateUrl: './filter-controls.component.html',
  styleUrls: ['./filter-controls.component.scss']
})
export class FilterControlsComponent implements OnInit, OnChanges {
  @Input() genre = '';
  @Input() releaseYearMin = 1900;
  @Input() releaseYearMax = new Date().getFullYear();
  @Input() imdbRatingMin = 0;
  @Input() rtRatingMin = 0;
  @Input() currentYear = new Date().getFullYear();
  @Input() provider = '';

  genres: string[] = [];
  readonly providers = [
    'Netflix',
    'Disney+',
    'Apple TV+',
    'Prime Video',
    'Paramount+',
    'Sky/Wow'
  ];

  private readonly providerLogoMap: Record<string, string> = {
    'Netflix': 'netflix.svg',
    'Disney+': 'disney-plus.svg',
    'Apple TV+': 'apple-tv.svg',
    'Prime Video': 'prime.svg',
    'Paramount+': 'paramount.svg',
    'Sky/Wow': 'sky.svg'
  };

  sliderOptions: Options = {
    floor: 1900,
    ceil: this.currentYear,
    step: 1,
    translate: (value: number) => `${value}`
  };

  @Output() filtersChange = new EventEmitter<Partial<FilterOptions>>();
  @Output() reset = new EventEmitter<void>();

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadGenres();
    this.sliderOptions.ceil = this.currentYear;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentYear']) {
      this.sliderOptions = { ...this.sliderOptions, ceil: this.currentYear };
    }
    if (changes['genre'] || changes['imdbRatingMin'] || changes['rtRatingMin'] || changes['releaseYearMin'] || changes['releaseYearMax'] || changes['provider']) {
      this.emitChange();
    }
  }

  loadGenres(): void {
    this.contentService.getGenres().subscribe({
      next: g => this.genres = g,
      error: () => debugError('Failed to load genres')
    });
  }

  selectGenre(genre: string): void {
    this.genre = genre;
    this.emitChange();
  }

  selectProvider(provider: string): void {
    this.provider = provider;
    this.emitChange();
  }

  emitChange(): void {
    this.filtersChange.emit({
      genre: this.genre,
      releaseYearMin: Number(this.releaseYearMin),
      releaseYearMax: Number(this.releaseYearMax),
      imdbRatingMin: Number(this.imdbRatingMin),
      rtRatingMin: Number(this.rtRatingMin),
      provider: this.provider
    });
  }

  triggerRipple(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const ripple = target.querySelector('.ripple') as HTMLElement;
    if (!ripple) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    ripple.classList.add('animate');
    setTimeout(() => ripple.classList.remove('animate'), 600);
  }

  hasActiveFilters(): boolean {
    return (
      this.genre !== '' ||
      this.releaseYearMin !== 1900 ||
      this.releaseYearMax !== this.currentYear ||
      this.imdbRatingMin > 0 ||
      this.rtRatingMin > 0 ||
      this.provider !== ''
    );
  }

  resetFilters(): void {
    this.genre = '';
    this.releaseYearMin = 1900;
    this.releaseYearMax = this.currentYear;
    this.imdbRatingMin = 0;
    this.rtRatingMin = 0;
    this.provider = '';
    this.emitChange();
    this.reset.emit();
  }

  getProviderLogoPath(provider: string): string {
    const file = this.providerLogoMap[provider];
    return '/assets/images/providers/' + file;
  }
}