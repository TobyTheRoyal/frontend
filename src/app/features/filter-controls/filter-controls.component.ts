import { Component, OnInit, OnChanges, SimpleChanges, HostListener, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options} from '@angular-slider/ngx-slider';
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

  genres: string[] = [];
  activeDropdown: string | null = null;

  sliderOptions: Options = {
  floor: 1900,
  ceil: this.currentYear,
  step: 1
};

  @Output() filtersChange = new EventEmitter<Partial<FilterOptions>>();
  @Output() reset = new EventEmitter<void>();


  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['genre'] || changes['imdbRatingMin'] || changes['rtRatingMin']) {
      // previously triggered a visual pulse effect here
    }
  }

  loadGenres(): void {
    this.contentService.getGenres().subscribe({
      next: g => this.genres = g,
      error: () => debugError('Failed to load genres')
    });
  }

  updateFilters(filters: Partial<FilterOptions>): void {
    this.filtersChange.emit(filters);
  }

  emitChange(): void {
    this.filtersChange.emit({
      genre: this.genre,
      releaseYearMin: this.releaseYearMin,
      releaseYearMax: this.releaseYearMax,
      imdbRatingMin: this.imdbRatingMin,
      rtRatingMin: this.rtRatingMin
    });
  }

  toggleDropdown(dropdown: string | null): void {
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdown;
      
    }
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
      this.rtRatingMin > 0
    );
  }

  resetFilters(): void {
    this.genre = '';
    this.releaseYearMin = 1900;
    this.releaseYearMax = this.currentYear;
    this.imdbRatingMin = 0;
    this.rtRatingMin = 0;
    this.emitChange();
    this.reset.emit();
    this.activeDropdown = null;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-panel')) {
      this.activeDropdown = null;
    }
  }
}
