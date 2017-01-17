function calcF(type) {
  return 1.8 + 0.1 * type;
}

// 零觉满级
export function calcMaxLv(value, type) {
  return Math.floor(value * calcF(type));
}

// 满觉满级
export function calcMaxLvAndGrow(value, type, rare) {
  const f = calcF(type)
  const levelPart = Math.floor(value * f)
  const growPart = Math.floor(value * (f - 1) / (19 + 10 * rare)) * 5 * (rare == 1 ? 5 : 15);
  return levelPart + growPart;
}

export function calcModeValues(value, type, rare) {
  return [value, calcMaxLv(value, type), calcMaxLvAndGrow(value, type, rare)];
}
