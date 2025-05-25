import { faker } from '@faker-js/faker';

const generateSentences = (duration) => {
  const blocks = generateBlocksWithLabel(duration);
  const flatSubtitles = [];

  for (const block of blocks) {
    const { start: blockStart, end: blockEnd, n_sentences, label: type } = block;
    const totalTime = blockEnd - blockStart;

    // 每段內的句子時間切割
    const sentenceDurations = [];
    let remaining = totalTime - (n_sentences - 1) * 0.1;

    for (let i = 0; i < n_sentences; i++) {
      const min = 1.0;
      let max = Math.min(3.0, remaining - (n_sentences - i - 1) * (1.0 + 0.1));
      if (max < 1.0) {
        max = 1.0; // ⚠️ 保底防錯，不讓 max 小於 min
      }
      const dur = i === n_sentences - 1
        ? remaining
        : faker.number.float({ min: 1.0, max, precision: 0.1 });

      sentenceDurations.push(dur);
      remaining -= dur;
    }

    // 產生字幕句子
    let cursor = blockStart;
    for (let i = 0; i < n_sentences; i++) {
      const wordCount = faker.number.int({ min: 5, max: 10 });
      const words = Array.from({ length: wordCount }, () => faker.word.sample());
      const text = words.join(' ');

      const start = parseFloat(cursor.toFixed(2));
      const end = parseFloat((cursor + sentenceDurations[i]).toFixed(2));

      flatSubtitles.push({
        type,
        start,
        end,
        text,
        suggested: false,
        highlighted: false
      });

      cursor = end + 0.1;
    }
  }

  // 加上隨機 suggested / highlighted（20%～45%）
  const count = flatSubtitles.length;
  const suggestedCount = faker.number.int({
    min: Math.floor(count * 0.2),
    max: Math.floor(count * 0.45)
  });

  const selectedIndices = faker.helpers.arrayElements(
    flatSubtitles.map((_, idx) => idx),
    suggestedCount
  );

  for (const idx of selectedIndices) {
    flatSubtitles[idx].suggested = true;
    flatSubtitles[idx].highlighted = true;
  }

  return flatSubtitles;
}

/**
 * 切出各字幕段落區塊 + 命名（introduction / dialog1 / conclusion）
 */
function generateBlocksWithLabel(duration) {
  const blocks = [];

  if (duration <= 1) return [];

  if (duration <= 4) {
    const padding = 0.2;
    const usable = duration - 2 * padding;
    if (usable < 1.5) return [];

    const blockLength = usable;
    const n = estimateSentenceCount(blockLength);
    return [{
      start: parseFloat(padding.toFixed(2)),
      end: parseFloat((padding + blockLength).toFixed(2)),
      n_sentences: n,
      label: 'introduction'
    }];
  }

  const headGap = faker.number.float({ min: 0.5, max: 1, precision: 0.1 });
  const tailGap = faker.number.float({ min: 0.5, max: 1, precision: 0.1 });
  const usableStart = headGap;
  const usableEnd = duration - tailGap;

  let timeCursor = usableStart;

  while (timeCursor < usableEnd) {
    const blockLength = faker.number.float({ min: 4, max: 9, precision: 0.1 });
    const n = estimateSentenceCount(blockLength);

    if (timeCursor + blockLength > usableEnd) break;

    blocks.push({
      start: parseFloat(timeCursor.toFixed(2)),
      end: parseFloat((timeCursor + blockLength).toFixed(2)),
      n_sentences: n
    });

    const gap = faker.number.float({ min: 3, max: 5, precision: 0.1 });
    timeCursor += blockLength + gap;
  }

  // 加上命名
  const len = blocks.length;
  if (len === 1) {
    blocks[0].label = 'introduction';
  } else if (len === 2) {
    blocks[0].label = 'introduction';
    blocks[1].label = 'conclusion';
  } else if (len >= 3) {
    blocks[0].label = 'introduction';
    for (let i = 1; i < len - 1; i++) {
      blocks[i].label = `dialog${i}`;
    }
    blocks[len - 1].label = 'conclusion';
  }

  if (blocks.length === 0 && duration >= 1) {
    const fallbackStart = faker.number.float({ min: 0.5, max: 1.0, precision: 0.1 });
    const fallbackLength = Math.min(3.0, duration - fallbackStart - 0.5);
    const fallbackEnd = fallbackStart + fallbackLength;

    blocks.push({
      start: parseFloat(fallbackStart.toFixed(2)),
      end: parseFloat(fallbackEnd.toFixed(2)),
      n_sentences: 1,
      label: 'introduction'
    });
  }

  return blocks;
}

/**
 * 根據時間長度決定能塞幾句字幕
 */
function estimateSentenceCount(blockLength) {
  const minPerSentence = 1.0;
  const maxPerSentence = 3.0;
  const maxN = 5;
  const minN = 2;

  const maxPossible = Math.floor((blockLength + 0.1) / (minPerSentence + 0.1));
  const minPossible = Math.ceil((blockLength + 0.1) / (maxPerSentence + 0.1));
  const n = faker.number.int({
    min: Math.max(minN, minPossible),
    max: Math.min(maxN, maxPossible),
  });

  return n;
}

export { generateSentences };