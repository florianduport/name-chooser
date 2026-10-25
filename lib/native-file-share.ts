export type FileShareNavigator = {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};

export function sharePreparedFile(
  navigatorLike: FileShareNavigator,
  file: File,
  text: string,
  url: string,
): Promise<void> | null {
  const data: ShareData = { files: [file], text, url };
  if (!navigatorLike.share || !navigatorLike.canShare?.({ files: [file] })) {
    return null;
  }
  // Intentionally call share synchronously. Callers must pass a pre-generated
  // file so iOS Safari still considers this part of the user's tap gesture.
  return navigatorLike.share(data);
}
