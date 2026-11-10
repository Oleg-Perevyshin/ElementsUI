/* Имитация графика (isTest): случайные значения от -50 до 50 по именам линий, без имён - три линии Test 1-3; грузится динамически только в режиме имитации */
import type { IGraphDataObject } from "../types"

export const testSample = (names: string[]): IGraphDataObject[] =>
  (names.length ? names : ["Test 1", "Test 2", "Test 3"]).map((name) => ({ name, value: Math.random() * 100 - 50 }))
