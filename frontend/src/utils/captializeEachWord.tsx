function capitalizeEachWord(str: string): string {
  return str
    .trim()
    .split(/\s+/) // handles multiple spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default capitalizeEachWord;