export interface Content {
    id: number;
    tmdbId: string;
    title: string;
    releaseYear: number;
    poster: string;
    type: 'movie' | 'series';
    imdbRating?: number;
    rtRating?: number;
    rating?: number;
  }