export const getSize = (array: Uint8Array): number => {
  const bytes = array.byteLength;
  const megabytes = bytes / (1024 * 1024);
  return megabytes;
};
