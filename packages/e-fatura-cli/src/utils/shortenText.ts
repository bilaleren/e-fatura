function shortenText(text: string): string {
  text = text.trim();

  if (text.length === 0) {
    return text;
  }

  const words = text
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length < 3) {
    return text;
  }

  const lastWord = words.pop()!;
  const chars = words.map((word) => word.charAt(0));

  return `${chars.join('.')} ${lastWord}`;
}

export default shortenText;
