// collisions.js
import Vec2 from "./Vec2.js";
import Ball from "./Ball.js";
import Box from "./Box.js";

/* ---------- helpers ---------- */

const EPSILON = 1e-5;

function nearlyEqual(a, b, epsilon = EPSILON) {
  return Math.abs(a - b) <= epsilon;
}

function nearlyEqualVec(a, b, epsilon = EPSILON) {
  if (!a || !b) return false;
  return nearlyEqual(a.x, b.x, epsilon) && nearlyEqual(a.y, b.y, epsilon);
}

function PointSegmentDistance(p, a, b) {
  const ab = b.subtract(a);
  const ap = p.subtract(a);

  const abLenSq = ab.lengthSquared();
  const proj = abLenSq === 0 ? 0 : Vec2.dot(ap, ab);
  const d = abLenSq === 0 ? 0 : proj / abLenSq;
  let cp = Vec2.ZERO;

  if (d <= 0) {
    cp = a;
  } else if (d >= 1) {
    cp = b;
  } else {
    cp = a.add(ab.multiply(d));
  }

  const dx = p.x - cp.x;
  const dy = p.y - cp.y;
  const distanceSquared = dx * dx + dy * dy;

  return [distanceSquared, cp];
}
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

export function intersectAABBs(a, b) {
  if(a.max.x <= b.min.x || b.max.x <= a.min.x || a.max.y <= b.min.y || b.max.y <= a.min.y)
    return false;

  return true;
}
/* help find contact point */

export function findContactPoints(objectA, objectB) {

  let contact1 = Vec2.ZERO;
  let contact2 = Vec2.ZERO;
  let contactCount = 0;

  if (objectA instanceof Box) {
    if (objectB instanceof Box) {
      return findContactPointsFromPolygons(
        objectA.getVertexWorldPos(),
        objectB.getVertexWorldPos()
      );
    }

    // Box vs Ball  (invert normal after circle-vs-poly to match A->B direction)
    else if (objectB instanceof Ball) {
      contact1 = findCirclePolygonContactPoint(
        objectB.pos,
        objectB.radius,
        objectA.pos,
        objectA.getVertexWorldPos()
      );
      contactCount = 1;
    }
  }

  // Ball vs ...
  else if (objectA instanceof Ball) {
    if (objectB instanceof Box) {
      contact1 = findCirclePolygonContactPoint(
        objectA.pos,
        objectA.radius,
        objectB.pos,
        objectB.getVertexWorldPos()
      );
      contactCount = 1;
    }

    else if (objectB instanceof Ball) {
      //there can only be one contact point between cirlce
      contact1 = findCircleCircleContactPoint(
        objectA.pos,
        objectA.radius,
        objectB.pos
      );
      contactCount = 1;
    }
  }

  return [contact1, contact2, contactCount];
}

function findContactPointsFromPolygons(verticesA, verticesB) {
  let contact1 = Vec2.ZERO;
  let contact2 = Vec2.ZERO;
  let contactCount = 0;
  let minDistSq = Number.POSITIVE_INFINITY;

  const tryUpdateContacts = (point, va, vb) => {
    const [distSq, cp] = PointSegmentDistance(point, va, vb);

    if (nearlyEqual(distSq, minDistSq)) {
      if (!nearlyEqualVec(cp, contact1) && !nearlyEqualVec(cp, contact2)) {
        contact2 = cp;
        contactCount = 2;
      }
    } else if (distSq < minDistSq) {
      minDistSq = distSq;
      contact1 = cp;
      contactCount = 1;
    }
  };

  for (let i = 0; i < verticesA.length; i++) {
    const p = verticesA[i];
    for (let j = 0; j < verticesB.length; j++) {
      const va = verticesB[j];
      const vb = verticesB[(j + 1) % verticesB.length];
      tryUpdateContacts(p, va, vb);
    }
  }

  for (let i = 0; i < verticesB.length; i++) {
    const p = verticesB[i];
    for (let j = 0; j < verticesA.length; j++) {
      const va = verticesA[j];
      const vb = verticesA[(j + 1) % verticesA.length];
      tryUpdateContacts(p, va, vb);
    }
  }

  return [contact1, contact2, contactCount];
}

function findCirclePolygonContactPoint(
  circleCenter,
  _circleRadius,
  _polygonCenter,
  polygonVertices
) {

  let minDistSq = Number.POSITIVE_INFINITY;
  let cp = Vec2.ZERO;

  for(let i = 0; i < polygonVertices.length; i++){
    let va = polygonVertices[i];
    let vb = polygonVertices[(i + 1) % polygonVertices.length];

    let [distSq, contact] = PointSegmentDistance(circleCenter,va,vb);

    if(distSq < minDistSq){
      minDistSq = distSq;
      cp = contact;
    }
  }
  return cp;
}

 function findCircleCircleContactPoint(centerA, radiusA, centerB) {
  let ab = centerB.subtract(centerA);
  let dir = ab.normalize();
  let cp = centerA.add(dir.multiply(radiusA));
  return cp;
}

export function collide(objectA, objectB) {
  // Prefer a definite zero vector to avoid Vec2.ZERO / ZERO() inconsistencies
  let normal = new Vec2(0, 0);
  let depth = 0;

  // Box vs Box
  if (objectA instanceof Box) {
    if (objectB instanceof Box) {
      const vertsA = objectA.getVertexWorldPos();
      const vertsB = objectB.getVertexWorldPos();

      const hit = intersectPolygons(objectA.pos, vertsA, objectB.pos, vertsB);
      if (!hit.result) return { result: false };
      normal = hit.normal;
      depth = hit.depth;
      return { result: true, normal, depth };
    }

    // Box vs Ball  (invert normal after circle-vs-poly to match A->B direction)
    if (objectB instanceof Ball) {
      const vertsA = objectA.getVertexWorldPos();
      const hit = intersectCirclePolygon(
        objectB.pos,
        objectB.radius,
        objectA.pos,
        vertsA
      );
      if (!hit.result) return { result: false };
      normal = hit.normal.negate(); // make normal point from A(Box) -> B(Ball)
      depth = hit.depth;
      return { result: true, normal, depth };
    }
  }

  // Ball vs ...
  if (objectA instanceof Ball) {
    if (objectB instanceof Box) {
      const vertsB = objectB.getVertexWorldPos();
      const hit = intersectCirclePolygon(
        objectA.pos,
        objectA.radius,
        objectB.pos,
        vertsB
      );
      if (!hit.result) return { result: false };
      normal = hit.normal; // already A(Ball) -> B(Box)
      depth = hit.depth;
      return { result: true, normal, depth };
    }

    if (objectB instanceof Ball) {
      const hit = intersectCircles(
        objectA.pos,
        objectA.radius,
        objectB.pos,
        objectB.radius
      );
      if (!hit.result) return { result: false };
      normal = hit.normal; // A -> B
      depth = hit.depth;
      return { result: true, normal, depth };
    }
  }

  return { result: false };
}

/* ---------- circle vs polygon (with polygon center) ---------- */
export function intersectCirclePolygon(
  circleCenter,
  circleRadius,
  polygonCenter,
  vertices
) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  // edges of polygon
  for (let i = 0; i < vertices.length; i++) {
    const va = vertices[i];
    const vb = vertices[(i + 1) % vertices.length];

    const edge = vb.subtract(va);
    let axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(vertices, axis);
    const { min: minB, max: maxB } = projectCircle(
      circleCenter,
      circleRadius,
      axis
    );

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
    const { min: minB, max: maxB } = projectCircle(
      circleCenter,
      circleRadius,
      axis
    );

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
export function intersectCirclePolygonVerticesOnly(
  circleCenter,
  circleRadius,
  vertices
) {
  let normal = Vec2.ZERO;
  let depth = Number.POSITIVE_INFINITY;

  // edges of polygon
  for (let i = 0; i < vertices.length; i++) {
    const va = vertices[i];
    const vb = vertices[(i + 1) % vertices.length];

    const edge = vb.subtract(va);
    let axis = new Vec2(-edge.y, edge.x).normalize();

    const { min: minA, max: maxA } = projectVertices(vertices, axis);
    const { min: minB, max: maxB } = projectCircle(
      circleCenter,
      circleRadius,
      axis
    );

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
    const { min: minB, max: maxB } = projectCircle(
      circleCenter,
      circleRadius,
      axis
    );

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
