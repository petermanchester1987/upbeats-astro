// Sorts src/data/songs.json alphabetically by artist (case-insensitive),
// then by title within an artist, and rewrites the file in place with
// consistent 2-space indentation. Run after adding/editing/removing songs:
//
//   npm run sort-songs
//
// See README.md → "Editing the song list".
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const songsPath = fileURLToPath(new URL('../src/data/songs.json', import.meta.url));

const songs = JSON.parse(await readFile(songsPath, 'utf-8'));

songs.sort((a, b) => {
  const artistCompare = a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });
  return artistCompare !== 0 ? artistCompare : a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
});

await writeFile(songsPath, `${JSON.stringify(songs, null, 2)}\n`, 'utf-8');

console.log(`Sorted ${songs.length} songs in songs.json by artist.`);
