/** Pixel "A" of the P5 mark: [x, y] of each 6×6 cell on a 48×48 grid. Shared by the logo and the share images. */
export const markCells: [number, number][] = [
	[8, 7], [15, 7], [22, 7],
	[1, 14], [29, 14],
	[1, 21], [8, 21], [15, 21], [22, 21], [29, 21],
	[1, 28], [29, 28],
	[1, 35], [29, 35],
];

/** Text cursor block beside the "A". */
export const markCursor = { x: 38, y: 7, width: 7, height: 34 };
