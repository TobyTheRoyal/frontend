export interface Content {
    id: string;
    tmdbId: string;
    title: string;
    releaseYear: number;
    poster: string;
    type: 'movie' | 'series';
    imdbRating?: number;
    rtRating?: number;
  }