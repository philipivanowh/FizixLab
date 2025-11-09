// collisions.js
import Vec2 from "./Vec2.js";

/* ---------- helpers ---------- */

function projectVertices(vertices, axis) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < vertices.length; i++) {
    const proj = Vec2.dot(vertices[i], axis);
    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }
  return { min, max };
}

function projectCircle(center, radius, axis) {
  // Note: axis itself needn't be unit length, so we compute a unit direction for the endpoints,
  // but still project onto the original (possibly non-unit) axis, just like the C#.
  const direction = axis.normalize();
  const dirRad = direction.multiply(radius);

  const p1 = center.add(dirRad);
  const p2 = center.subtract(dirRad);

  let min = Vec2.dot(p1, axis);
  let max = Vec2.dot(p2, axis);
  if (min > max) {
    const t = min;
    min = max;
    max = t;
  }
  return { min, max };
}

function findClosestPointOnPolygon(circleCenter, vertices) {
  let result = -1;
  let minDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    const d = Vec2.distance(v, circleCenter);
    if (d < minDistance) {
      minDistance = d;
      result = i;
    }
  }
  return result;
}

function findArithmeticMean(vertices) {
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < vertices.length; i++) {
    sumX += vertices[i].x;
    sumY += vertices[i].y;
  }
  return new Vec2(sumX / vertices.length, sumY / vertices.length);
}

/* ---------- circle vs polygon (with polygon center) ---------- */
export function intersectCirclePolygon(circleCenter, circleRadius, polygonCenter, vertices) {
  console.log(circleCenter);
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  // edges of polygon
  for (let i = 0; i < vertices.length; i++) {
    const va = vertices[i];
    const vb = vertices[(i + 1) % vertices.length];

    const edge = vb.subtract(va);
    let axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(vertices, axis);
    const { min: minB, max: maxB } = projectCircle(circleCenter, circleRadius, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  // closest polygon vertex to circle center
  const cpIndex = findClosestPointOnPolygon(circleCenter, vertices);
  const cp = vertices[cpIndex];

  let axis = cp.subtract(circleCenter).normalize();

  {
    const { min: minA, max: maxA } = projectVertices(vertices, axis);
    const { min: minB, max: maxB } = projectCircle(circleCenter, circleRadius, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const direction = polygonCenter.subtract(circleCenter);
  if (Vec2.dot(direction, normal) < 0) {
    normal = normal.negate();
  }

  return { result: true, normal, depth };
}

/* ---------- circle vs polygon (no polygon center provided) ---------- */
export function intersectCirclePolygonVerticesOnly(circleCenter, circleRadius, vertices) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  // edges of polygon
  for (let i = 0; i < vertices.length; i++) {
    const va = vertices[i];
    const vb = vertices[(i + 1) % vertices.length];

    const edge = vb.subtract(va);
    let axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(vertices, axis);
    const { min: minB, max: maxB } = projectCircle(circleCenter, circleRadius, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  // closest polygon vertex to circle center
  const cpIndex = findClosestPointOnPolygon(circleCenter, vertices);
  const cp = vertices[cpIndex];

  let axis = cp.subtract(circleCenter).normalize();

  {
    const { min: minA, max: maxA } = projectVertices(vertices, axis);
    const { min: minB, max: maxB } = projectCircle(circleCenter, circleRadius, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  // compute polygon center from vertices
  const polygonCenter = findArithmeticMean(vertices);
  const direction = polygonCenter.subtract(circleCenter);
  if (Vec2.dot(direction, normal) < 0) {
    normal = normal.negate();
  }

  return { result: true, normal, depth };
}

/* ---------- polygon vs polygon (with centers) ---------- */
export function intersectPolygons(centerA, verticesA, centerB, verticesB) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  // axes from A
  for (let i = 0; i < verticesA.length; i++) {
    const va = verticesA[i];
    const vb = verticesA[(i + 1) % verticesA.length];

    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(verticesA, axis);
    const { min: minB, max: maxB } = projectVertices(verticesB, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  // axes from B
  for (let i = 0; i < verticesB.length; i++) {
    const va = verticesB[i];
    const vb = verticesB[(i + 1) % verticesB.length];

    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(verticesA, axis);
    const { min: minB, max: maxB } = projectVertices(verticesB, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const direction = centerB.subtract(centerA);
  if (Vec2.dot(direction, normal) < 0) {
    normal = normal.negate();
  }

  return { result: true, normal, depth };
}

/* ---------- polygon vs polygon (vertices only) ---------- */
export function intersectPolygonsVerticesOnly(verticesA, verticesB) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  // axes from A
  for (let i = 0; i < verticesA.length; i++) {
    const va = verticesA[i];
    const vb = verticesA[(i + 1) % verticesA.length];

    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(verticesA, axis);
    const { min: minB, max: maxB } = projectVertices(verticesB, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  // axes from B
  for (let i = 0; i < verticesB.length; i++) {
    const va = verticesB[i];
    const vb = verticesB[(i + 1) % verticesB.length];

    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(verticesA, axis);
    const { min: minB, max: maxB } = projectVertices(verticesB, axis);

    if (minA >= maxB || minB >= maxA) {
      return { result: false };
    }

    const axisDepth = globalThis.Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const centerA = findArithmeticMean(verticesA);
  const centerB = findArithmeticMean(verticesB);
  const direction = centerB.subtract(centerA);

  if (Vec2.dot(direction, normal) < 0) {
    normal = normal.negate();
  }

  return { result: true, normal, depth };
}

/* ---------- circle vs circle ---------- */
export function intersectCircles(centerA, radiusA, centerB, radiusB) {
  const distance = Vec2.distance(centerA, centerB);
  const radii = radiusA + radiusB;

  if (distance >= radii) {
    return { result: false };
  }

  const normal = centerB.subtract(centerA).normalize();
  const depth = radii - distance;

  return { result: true, normal, depth };
}
