import Vec2 from './Vec2.js';

function projectVertices(vertices, axis) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  vertices.forEach((v) => {
    const projection = Vec2.dot(v, axis);
    if (projection < min) {
      min = projection;
    }
    if (projection > max) {
      max = projection;
    }
  });

  return { min, max };
}

function projectCircle(center, radius, axis) {
  const direction = axis.normalize();
  const directionAndRadius = direction.multiply(radius);

  const p1 = center.add(directionAndRadius);
  const p2 = center.subtract(directionAndRadius);

  let min = Vec2.dot(p1, axis);
  let max = Vec2.dot(p2, axis);

  if (min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }

  return { min, max };
}

function findClosestPointOnPolygon(circleCenter, vertices) {
  let result = -1;
  let minDistance = Number.POSITIVE_INFINITY;

  vertices.forEach((v, index) => {
    const distance = Vec2.distance(v, circleCenter);
    if (distance < minDistance) {
      minDistance = distance;
      result = index;
    }
  });

  return result;
}

function findArithmeticMean(vertices) {
  let sumX = 0;
  let sumY = 0;

  vertices.forEach((v) => {
    sumX += v.x;
    sumY += v.y;
  });

  return new Vec2(sumX / vertices.length, sumY / vertices.length);
}

export function intersectCirclePolygon(circleCenter, circleRadius, polygonCenter, vertices) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  for (let i = 0; i < vertices.length; i++) {
    const va = vertices[i];
    const vb = vertices[(i + 1) % vertices.length];

    const edge = vb.subtract(va);
    let axis = new Vec2(-edge.y, edge.x).normalize();

    const projectionA = projectVertices(vertices, axis);
    const projectionB = projectCircle(circleCenter, circleRadius, axis);

    if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
      return { result: false };
    }

    const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const cpIndex = findClosestPointOnPolygon(circleCenter, vertices);
  const cp = vertices[cpIndex];

  let axis = cp.subtract(circleCenter).normalize();

  const projectionA = projectVertices(vertices, axis);
  const projectionB = projectCircle(circleCenter, circleRadius, axis);

  if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
    return { result: false };
  }

  const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

  if (axisDepth < depth) {
    depth = axisDepth;
    normal = axis;
  }

  const direction = polygonCenter.subtract(circleCenter);

  if (Vec2.dot(direction, normal) < 0) {
    normal = normal.negate();
  }

  return { result: true, normal, depth };
}

export function intersectCirclePolygonVerticesOnly(circleCenter, circleRadius, vertices) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  for (let i = 0; i < vertices.length; i++) {
    const va = vertices[i];
    const vb = vertices[(i + 1) % vertices.length];

    const edge = vb.subtract(va);
    let axis = new Vec2(-edge.y, edge.x).normalize();

    const projectionA = projectVertices(vertices, axis);
    const projectionB = projectCircle(circleCenter, circleRadius, axis);

    if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
      return { result: false };
    }

    const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  const cpIndex = findClosestPointOnPolygon(circleCenter, vertices);
  const cp = vertices[cpIndex];

  let axis = cp.subtract(circleCenter).normalize();

  const projectionA = projectVertices(vertices, axis);
  const projectionB = projectCircle(circleCenter, circleRadius, axis);

  if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
    return { result: false };
  }

  const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

  if (axisDepth < depth) {
    depth = axisDepth;
    normal = axis;
  }

  const polygonCenter = findArithmeticMean(vertices);
  const direction = polygonCenter.subtract(circleCenter);

  if (Vec2.dot(direction, normal) < 0) {
    normal = normal.negate();
  }

  return { result: true, normal, depth };
}

export function intersectPolygons(centerA, verticesA, centerB, verticesB) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  for (let i = 0; i < verticesA.length; i++) {
    const va = verticesA[i];
    const vb = verticesA[(i + 1) % verticesA.length];
    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const projectionA = projectVertices(verticesA, axis);
    const projectionB = projectVertices(verticesB, axis);

    if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
      return { result: false };
    }

    const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  for (let i = 0; i < verticesB.length; i++) {
    const va = verticesB[i];
    const vb = verticesB[(i + 1) % verticesB.length];
    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const projectionA = projectVertices(verticesA, axis);
    const projectionB = projectVertices(verticesB, axis);

    if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
      return { result: false };
    }

    const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

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

export function intersectPolygonsVerticesOnly(verticesA, verticesB) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  for (let i = 0; i < verticesA.length; i++) {
    const va = verticesA[i];
    const vb = verticesA[(i + 1) % verticesA.length];
    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const projectionA = projectVertices(verticesA, axis);
    const projectionB = projectVertices(verticesB, axis);

    if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
      return { result: false };
    }

    const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
  }

  for (let i = 0; i < verticesB.length; i++) {
    const va = verticesB[i];
    const vb = verticesB[(i + 1) % verticesB.length];
    const edge = vb.subtract(va);
    const axis = new Vec2(-edge.y, edge.x).normalize();

    const projectionA = projectVertices(verticesA, axis);
    const projectionB = projectVertices(verticesB, axis);

    if (projectionA.min >= projectionB.max || projectionB.min >= projectionA.max) {
      return { result: false };
    }

    const axisDepth = Math.min(projectionB.max - projectionA.min, projectionA.max - projectionB.min);

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
