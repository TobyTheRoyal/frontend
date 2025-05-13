import { Component, OnInit }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { ActivatedRoute }              from '@angular/router';
import { ContentService }              from '../../core/services/content.service';
import { Content }                     from '../../interfaces/content.interface';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './series-detail.component.html',
  styleUrls: ['./series-detail.component.scss']
})
export class SeriesDetailComponent implements OnInit {
  series: Content | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {}

  ngOnInit() {
    const tmdbId = this.route.snapshot.paramMap.get('id')!;
    this.contentService.getSeriesDetails(tmdbId).subscribe({
      next: s => {
        this.series = s;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}