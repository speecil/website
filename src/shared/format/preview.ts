// hash must be lowered, realised after too much time :(
export const getBeatSaverPreviewUrl = (hash?: string | null) => (hash ? `https://cfcdn.beatsaver.com/${hash.toLowerCase()}.mp3` : undefined);
