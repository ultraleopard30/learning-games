export interface MathProblem {
  num1: number;
  num2: number;
  operation: '+' | '-';
  answer: number;
  display: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(): MathProblem {
  const operation = Math.random() < 0.5 ? '+' : '-';

  if (operation === '+') {
    const num1 = randomInt(0, 9);
    const num2 = randomInt(0, 9);
    return {
      num1,
      num2,
      operation,
      answer: num1 + num2,
      display: `${num1} + ${num2}`,
    };
  } else {
    // Subtraction: ensure no negatives
    const big = randomInt(1, 9);
    const small = randomInt(0, big);
    return {
      num1: big,
      num2: small,
      operation,
      answer: big - small,
      display: `${big} - ${small}`,
    };
  }
}

export function getRandomProblems(count: number): MathProblem[] {
  const problems: MathProblem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(generateProblem());
  }
  return problems;
}
