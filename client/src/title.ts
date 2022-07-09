export function setTitle(title?: string) {
  const subtitle = "Untitled Tile Game";
  document.title = title ? `${title} | ${subtitle}` : subtitle;
}
