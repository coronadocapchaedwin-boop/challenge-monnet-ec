import path from 'node:path';
import * as XLSX from '@e965/xlsx';

export interface PokemonRow {
  excelRow: number;
  id: number;
  name: string;
  abilities: string[];
}

interface ExcelPokemonRow {
  id: number;
  name: string;
  abilities: string;
  __rowNum__: number;
}

export function readPokemonData(): PokemonRow[] {
  const workbook = XLSX.readFile(path.resolve(__dirname, 'Datos-pruebas.xlsx'));
  const sheet = workbook.Sheets.Pokemon;

  return XLSX.utils.sheet_to_json<ExcelPokemonRow>(sheet).map((row) => ({
    excelRow: row.__rowNum__ + 1,
    id: row.id,
    name: row.name,
    abilities: row.abilities.split(',').map((ability) => ability.trim()),
  }));
}
