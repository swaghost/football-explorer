import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MockPositionsService {
  // Position definitions
  private positions = [
    { name: 'Goalkeeper', abbrev: 'GK', number: 1 },
    { name: 'Center Back (Right)', abbrev: 'RCB', number: 4 },
    { name: 'Center Back (Left)', abbrev: 'LCB', number: 5 },
    { name: 'Wing Back (Right)', abbrev: 'RWB', number: 2 },
    { name: 'Wing Back (Left)', abbrev: 'LWB', number: 3 },
    { name: 'Holding Midfielder', abbrev: 'HM', number: 6 },
    { name: 'Central Defensive Midfielder', abbrev: 'CDM', number: 6 },
    { name: 'Pivot 1', abbrev: 'P1', number: 6 },
    { name: 'Pivot 2', abbrev: 'P2', number: 8 },
    { name: 'Attacking Midfielder', abbrev: 'AM', number: 7 },
    { name: 'Central Attacking Midfielder', abbrev: 'CAM', number: 10 },
    { name: 'Wing Forward (Left)', abbrev: 'LWF', number: 7 },
    { name: 'Wing Forward (Right)', abbrev: 'RWF', number: 11 },
    { name: 'Striker/Center Forward', abbrev: 'ST', number: 9 },
    { name: 'Raumdeuter', abbrev: 'RAUM', number: 10 },
  ];

  /**
   * Get unique position abbreviations from positions array
   */
  get positionAbbreviations(): string[] {
    const abbrevSet = new Set(this.positions.map((p) => p.abbrev));
    return Array.from(abbrevSet);
  }

  /**
   * Get unique position numbers from positions array
   */
  get positionNumbers(): number[] {
    const numberSet = new Set(this.positions.map((p) => p.number));
    return Array.from(numberSet).sort((a, b) => a - b);
  }

  /**
   * Get all position abbreviations
   */
  getPositionAbbreviations(): string[] {
    return [...this.positionAbbreviations];
  }

  /**
   * Get all position numbers (1-11)
   */
  getPositionNumbers(): number[] {
    return [...this.positionNumbers];
  }

  /**
   * Get all position definitions with name, abbreviation, and number
   */
  getPositions(): Array<{ name: string; abbrev: string; number: number }> {
    return [...this.positions];
  }

  /**
   * Get a random position for a jersey number
   * @param jerseyNumber Jersey number to get position for
   * @returns Position object or undefined
   */
  getPositionForJerseyNumber(
    jerseyNumber: number
  ): { name: string; abbrev: string; number: number } | undefined {
    if (jerseyNumber === 1) {
      // Goalkeeper gets jersey number 1
      return this.positions.find((p) => p.abbrev === 'GK');
    } else {
      // Other positions for jersey numbers 2+
      const nonGoalkeeperPositions = this.positions.filter(
        (p) => p.abbrev !== 'GK'
      );
      return nonGoalkeeperPositions[
        Math.floor(Math.random() * nonGoalkeeperPositions.length)
      ];
    }
  }
}
