import { gridBeat } from '../models/gridBeat.model';
import * as Tone from 'tone';

export const makeGrid = (notes: string[]) => {
  const rows: gridBeat[][] = []

  for (let i = 0; i < notes.length; i++) {
    const row: gridBeat[] = []
    for (let j = 0; j < 16; j++) {
      row.push({ note: notes[i], isActive: false })
    }
    rows.push(row)
  }
  return rows
}

export const updateBeatStatus = (
  grid: gridBeat[][],
  rowIndex: number,
  stepIndex: number,
  isActive: boolean
): gridBeat[][] => {
  if (!grid || rowIndex < 0 || rowIndex >= grid.length ||
      stepIndex < 0 || stepIndex >= grid[rowIndex].length) {
    return grid;
  }


  const newGrid: gridBeat[][] = grid.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        return row.map((step, sIndex) => {
          if (sIndex === stepIndex) {
            return { ...step, isActive: isActive };
          } else {
            return step;
          }
        });
      } else {
        return row;
      }
    });
    return newGrid;
  };

 export const makeSynths = (count: number, oscType: any): Tone.Synth[] => {
    const synths: Tone.Synth[] = [];
    for (let i = 0; i < count; i++) {
      let synth = new Tone.Synth({ oscillator: { type: oscType } }).toDestination();
      synths.push(synth);
    }
    return synths;
  }
