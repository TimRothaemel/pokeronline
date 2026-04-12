type Card = {
  color: string;
  number: number | string;
  value: number;
};

type HandResult = {
  cards: Card[];
  category: number;
  label: string;
  score: number[];
};

const HAND_LABELS = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
];

function getStraightHigh(values: number[]) {
  const unique = [...new Set(values)].sort((a, b) => b - a);

  if (unique.includes(14)) {
    unique.push(1);
  }

  for (let index = 0; index <= unique.length - 5; index += 1) {
    let isStraight = true;

    for (let offset = 0; offset < 4; offset += 1) {
      if (unique[index + offset] - 1 !== unique[index + offset + 1]) {
        isStraight = false;
        break;
      }
    }

    if (isStraight) {
      return unique[index] === 1 ? 5 : unique[index];
    }
  }

  return null;
}

function compareScore(left: number[], right: number[]) {
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

function evaluateFiveCardHand(cards: Card[]): HandResult {
  const values = cards.map((card) => card.value).sort((a, b) => b - a);
  const countsByValue = new Map<number, number>();

  values.forEach((value) => {
    countsByValue.set(value, (countsByValue.get(value) ?? 0) + 1);
  });

  const countEntries = [...countsByValue.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return right[0] - left[0];
  });

  const isFlush = cards.every((card) => card.color === cards[0].color);
  const straightHigh = getStraightHigh(values);

  if (isFlush && straightHigh) {
    return {
      cards,
      category: 8,
      label: HAND_LABELS[8],
      score: [8, straightHigh],
    };
  }

  if (countEntries[0][1] === 4) {
    const quadValue = countEntries[0][0];
    const kicker = countEntries.find((entry) => entry[0] !== quadValue)?.[0] ?? 0;

    return {
      cards,
      category: 7,
      label: HAND_LABELS[7],
      score: [7, quadValue, kicker],
    };
  }

  if (countEntries[0][1] === 3 && countEntries[1]?.[1] === 2) {
    return {
      cards,
      category: 6,
      label: HAND_LABELS[6],
      score: [6, countEntries[0][0], countEntries[1][0]],
    };
  }

  if (isFlush) {
    return {
      cards,
      category: 5,
      label: HAND_LABELS[5],
      score: [5, ...values],
    };
  }

  if (straightHigh) {
    return {
      cards,
      category: 4,
      label: HAND_LABELS[4],
      score: [4, straightHigh],
    };
  }

  if (countEntries[0][1] === 3) {
    const trips = countEntries[0][0];
    const kickers = countEntries
      .filter((entry) => entry[0] !== trips)
      .map((entry) => entry[0])
      .sort((a, b) => b - a);

    return {
      cards,
      category: 3,
      label: HAND_LABELS[3],
      score: [3, trips, ...kickers],
    };
  }

  if (countEntries[0][1] === 2 && countEntries[1]?.[1] === 2) {
    const highPair = Math.max(countEntries[0][0], countEntries[1][0]);
    const lowPair = Math.min(countEntries[0][0], countEntries[1][0]);
    const kicker = countEntries.find((entry) => entry[1] === 1)?.[0] ?? 0;

    return {
      cards,
      category: 2,
      label: HAND_LABELS[2],
      score: [2, highPair, lowPair, kicker],
    };
  }

  if (countEntries[0][1] === 2) {
    const pairValue = countEntries[0][0];
    const kickers = countEntries
      .filter((entry) => entry[1] === 1)
      .map((entry) => entry[0])
      .sort((a, b) => b - a);

    return {
      cards,
      category: 1,
      label: HAND_LABELS[1],
      score: [1, pairValue, ...kickers],
    };
  }

  return {
    cards,
    category: 0,
    label: HAND_LABELS[0],
    score: [0, ...values],
  };
}

function combinations<T>(items: T[], size: number) {
  const result: T[][] = [];

  function build(startIndex: number, current: T[]) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    for (let index = startIndex; index < items.length; index += 1) {
      current.push(items[index]);
      build(index + 1, current);
      current.pop();
    }
  }

  build(0, []);
  return result;
}

export function evaluateBestHand(cards: Card[]) {
  const allHands = combinations(cards, 5).map((hand) => evaluateFiveCardHand(hand));
  let bestHand = allHands[0];

  for (const hand of allHands.slice(1)) {
    if (compareScore(hand.score, bestHand.score) > 0) {
      bestHand = hand;
    }
  }

  return bestHand;
}

export function compareHands(left: HandResult, right: HandResult) {
  return compareScore(left.score, right.score);
}
