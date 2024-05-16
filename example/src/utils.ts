export type Dimension = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Rectangle = Point & Dimension;

export const getCenteredRectangle = (
  width: number,
  height: number,
  frame: Dimension
) => {
  const centerPoint = {
    x: frame.width / 2,
    y: frame.height / 2,
  };
  return {
    x: Math.round(centerPoint.x - width / 2),
    y: Math.round(centerPoint.y - height / 2),
    width,
    height,
  };
};

export const getCenteredSquare = (size: number, frame: Dimension) => {
  return getCenteredRectangle(size, size, frame);
};
