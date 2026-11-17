import { randomInt } from "node:crypto";

const hasValidLuhnChecksum = (number) =>
  [...number].reverse().reduce((sum, character, index) => {
    let digit = Number(character);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    return sum + digit;
  }, 0) % 10 === 0;

const createDemoCardNumber = () => {
  let number = `0000${Array.from({ length: 12 }, () => randomInt(10)).join("")}`;
  if (hasValidLuhnChecksum(number)) {
    const lastDigit = Number(number.at(-1));
    number = `${number.slice(0, -1)}${(lastDigit + 1) % 10}`;
  }
  return number;
};

const createDemoCardExpiry = () => {
  const monthOffset = randomInt(36, 61);
  const now = new Date();
  const totalMonth = now.getUTCMonth() + monthOffset;
  const month = (totalMonth % 12) + 1;
  const year = now.getUTCFullYear() + Math.floor(totalMonth / 12);
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
};

export const createDemoATMCardDetails = () => ({
  demoCardNumber: createDemoCardNumber(),
  demoCardExpiry: createDemoCardExpiry(),
  demoCardCcv: String(randomInt(1000)).padStart(3, "0"),
});
