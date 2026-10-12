import type { Album } from "../types";

// Album search via the public iTunes Search API (no key, CORS-enabled).
// Used by the rating form to find the album and its cover art.

interface ItunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  releaseDate?: string;
  artworkUrl100?: string;
}

export interface AlbumSearchResult extends Album {
  id: string;
}

export async function searchAlbums(term: string, signal?: AbortSignal): Promise<AlbumSearchResult[]> {
  const query = term.trim();
  if (query.length < 2) return [];

  const url = `https://itunes.apple.com/search?entity=album&limit=8&term=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Album search failed (${res.status})`);

  const data = (await res.json()) as { results: ItunesAlbum[] };
  return data.results
    .filter((r) => r.artworkUrl100)
    .map((r) => ({
      id: String(r.collectionId),
      title: r.collectionName,
      artist: r.artistName,
      year: r.releaseDate ? Number(r.releaseDate.slice(0, 4)) : null,
      // The API returns 100px art; the same URL serves any size.
      coverUrl: r.artworkUrl100!.replace("100x100bb", "600x600bb"),
    }));
}
