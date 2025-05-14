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
    genres?: string[];
    overview?: string; 
    cast?: CastMember[];        // Handlungsübersicht        // z.B. ['Drama','Action']
    language?: string;         // ISO-Code, z.B. 'en', 'de'

  }

  export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePathUrl: string;    // komplette URL zum Profilbild
}