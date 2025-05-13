export interface Content {
    id: number;
    tmdbId: string;
    title: string;
    releaseYear: number;
    poster: string;
    type: 'movie' | 'tv';
    imdbRating?: number;
    rtRating?: number;
    rating?: number;
  }