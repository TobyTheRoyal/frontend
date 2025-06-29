import { Component, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/services/content.service';
import { FilterOptions } from '../../core/services/filter.service';
import { debugError } from '../../core/utils/logger';

@Component({
  selector: 'app-filter-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  @Output() filtersChange = new EventEmitter<Partial<FilterOptions>>();
  @Output() reset = new EventEmitter<void>();

  @ViewChild('rangeSlider', { static: false })
  rangeSlider!: ElementRef<HTMLDivElement>;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['releaseYearMin'] || changes['releaseYearMax']) {
      this.updateRangeSlider();
    }
    if (changes['genre'] || changes['imdbRatingMin'] || changes['rtRatingMin']) {
      this.pulseFilter();
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
      if (dropdown === 'year') {
        setTimeout(() => this.updateRangeSlider(), 0);
      }
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

  updateRangeSlider(): void {
    if (this.rangeSlider && this.rangeSlider.nativeElement) {
      this.rangeSlider.nativeElement.style.setProperty('--min-value', this.releaseYearMin.toString());
      this.rangeSlider.nativeElement.style.setProperty('--max-value', this.releaseYearMax.toString());
      this.rangeSlider.nativeElement.style.setProperty('--current-year', this.currentYear.toString());
    }
  }

  applyImdbFilter(): void {
    this.updateFilters({ imdbRatingMin: this.imdbRatingMin });
    this.toggleDropdown(null);
  }

  applyRtFilter(): void {
    this.updateFilters({ rtRatingMin: this.rtRatingMin });
    this.toggleDropdown(null);
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

  pulseFilter(): void {
    const controls = document.querySelectorAll<HTMLElement>('.filter-control');
    controls.forEach(control => {
      control.classList.add('pulse');
      setTimeout(() => control.classList.remove('pulse'), 500);
    });
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
    if (!target.closest('.filter-control') && !target.closest('.dropdown-panel')) {
      this.activeDropdown = null;
    }
  }
}
