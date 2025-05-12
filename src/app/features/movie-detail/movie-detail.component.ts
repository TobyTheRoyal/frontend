import { Component, OnInit }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { ActivatedRoute }              from '@angular/router';
import { ContentService }              from '../../core/services/content.service';
import { Content }                     from '../../interfaces/content.interface';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit {
  movie: Content | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {}

  ngOnInit() {
    const tmdbId = this.route.snapshot.paramMap.get('id')!;
    this.contentService.getMovieDetails(tmdbId).subscribe({
      next: m => {
        this.movie = m;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}