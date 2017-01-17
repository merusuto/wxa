export const ELEMENT_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];

export function getPolygonPointsString(points) {
  return points.map(point => `${point.x},${point.y}`).join(" ");
}

const backgroundPolygons = {}
export function getBackgroundPolygonPointsString(canvas, radius) {
  if (backgroundPolygons[radius]) return backgroundPolygons[radius];

  const center = { x: canvas / 2, y: canvas / 2 };
  const points = [0, 1, 2, 3, 4].map(index => {
    const angle = (index * 72 - 90) * (Math.PI * 2) / 360;
    return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
  });

  return backgroundPolygons[radius] = getPolygonPointsString(points);
}

export function getElementPolygonPointsString(item, canvas, radius) {
  const elements = [item.fire, item.aqua, item.wind, item.light, item.dark];
  const center = { x: canvas / 2, y: canvas / 2 };
  const points = [0, 1, 2, 3, 4].map(index => {
    const angle = (index * 72 - 90) * (Math.PI * 2) / 360;
    return { x: center.x + Math.cos(angle) * radius * elements[index], y: center.y + Math.sin(angle) * radius * elements[index] };
  });

  return getPolygonPointsString(points);
}

export function getElementSVGString(item) {
  return `<svg xmlns='http://www.w3.org/2000/svg'><polygon points='${getBackgroundPolygonPointsString(80, 40)}' style='fill: #000; opacity: 0.05;'></polygon><polygon points='${getBackgroundPolygonPointsString(80, 26.7)}' style='fill: #000; opacity: 0.05;'></polygon><polygon points='${getBackgroundPolygonPointsString(80, 13.3)}'  style='fill: #000; opacity: 0.05;'></polygon><polygon points='${getElementPolygonPointsString(item, 80, 20)}' style='fill: ${ELEMENT_COLORS[item.element - 1]}; opacity: 0.5;'></polygon></svg>`
}
