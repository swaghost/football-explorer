import { Injectable } from '@angular/core';

export interface IMiniMatchBaseFormatPosition {
  playerNumber: number;
  playerPositionAbbrev: string;
  playerX: number;
  playerY: number;
}

export interface IMiniMatchBaseFormat {
  baseFormatName: string;
  baseFormatPositions: IMiniMatchBaseFormatPosition[];
}

export interface IFieldBackgroundOption {
  label: string;
  value: string;
  file: string;
}

@Injectable({
  providedIn: 'root',
})
export class MiniMatchFormationsService {
  // Field background options
  private fieldBackgroundOptions: IFieldBackgroundOption[] = [
    { label: 'Guardiola', value: 'Guardiola', file: 'field.guardiola.svg' },
    {
      label: 'Guardiola Green',
      value: 'GuardiolaGreen',
      file: 'field.guardiola.green.svg',
    },
    { label: 'Nagalsmann', value: 'Nagalsmann', file: 'field.nagalsmann.svg' },
    {
      label: 'Nagalsmann Green',
      value: 'NagalsmannGreen',
      file: 'field.nagalsmann.green.svg',
    },
    { label: 'Standard', value: 'Standard', file: 'field.standard.svg' },
    {
      label: 'Standard Green',
      value: 'StandardGreen',
      file: 'field.standard.green.svg',
    },
    { label: 'Futsal', value: 'Futsal', file: 'field.futsal.svg' },
  ];

  // Base formations with structured positions (vertical field orientation)
  // Field dimensions: 660x1000
  private baseFormationOptions: IMiniMatchBaseFormat[] = [
    {
      baseFormatName: 'Final Third - W',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 200,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 330,
          playerY: 350,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 460,
          playerY: 350,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 180,
          playerY: 500,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 500,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 480,
          playerY: 500,
        },
      ],
    },
    {
      baseFormatName: 'Middle Third - Progression',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 200,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 330,
          playerY: 350,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 460,
          playerY: 350,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 180,
          playerY: 500,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 500,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 480,
          playerY: 500,
        },
      ],
    },
    {
      baseFormatName: 'Buildout - La Salidia Lavolpiana (vs Single Striker)',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'DM',
          playerX: 330,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 220,
          playerY: 400,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 440,
          playerY: 400,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 200,
          playerY: 550,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 650,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 460,
          playerY: 550,
        },
      ],
    },
    {
      baseFormatName: 'Buildout - La Salidia Lavolpiana (vs Double Striker)',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'DM',
          playerX: 330,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 220,
          playerY: 420,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 440,
          playerY: 420,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 200,
          playerY: 550,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 280,
          playerY: 650,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'ST',
          playerX: 380,
          playerY: 650,
        },
      ],
    },
    {
      baseFormatName: 'Buildout - Di Zerbi - Box',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 300,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 300,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 450,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 450,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 600,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 450,
        },
      ],
    },
    {
      baseFormatName: 'Buildout - Di Zerbi - Attacking Covershadows',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 320,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 320,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 480,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 480,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 620,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 480,
        },
      ],
    },
    {
      baseFormatName: 'Buildout - Di Zerbi - Hourglass',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 220,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 440,
          playerY: 350,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 500,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 480,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 650,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 500,
        },
      ],
    },
    {
      baseFormatName: 'Kickoff - 3-5-2',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 220,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 330,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'CB',
          playerX: 440,
          playerY: 200,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RWB',
          playerX: 120,
          playerY: 350,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 380,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 380,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'LWB',
          playerX: 540,
          playerY: 350,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 250,
          playerY: 550,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'ST',
          playerX: 410,
          playerY: 550,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 650,
        },
      ],
    },
    {
      baseFormatName: 'Kickoff - 4-4-2',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 120,
          playerY: 400,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 400,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 400,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 540,
          playerY: 400,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 250,
          playerY: 600,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'ST',
          playerX: 410,
          playerY: 600,
        },
      ],
    },
    {
      baseFormatName: 'Kickoff - 4-5-1',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 120,
          playerY: 380,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 350,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 540,
          playerY: 380,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 480,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 650,
        },
      ],
    },
    {
      baseFormatName: 'CK - Stack',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 380,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 380,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 200,
          playerY: 500,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 500,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 630,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 460,
          playerY: 500,
        },
      ],
    },
    {
      baseFormatName: 'CK - Pack',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 220,
          playerY: 450,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 330,
          playerY: 450,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 440,
          playerY: 450,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 200,
          playerY: 600,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 620,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 460,
          playerY: 600,
        },
      ],
    },
    {
      baseFormatName: 'CK - Even Distribution',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 150,
          playerY: 300,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 300,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 300,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 510,
          playerY: 300,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 200,
          playerY: 450,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 330,
          playerY: 450,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 460,
          playerY: 450,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 120,
          playerY: 600,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 600,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 540,
          playerY: 600,
        },
      ],
    },
    {
      baseFormatName: 'CK - Short #1',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 280,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 380,
          playerY: 350,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 200,
          playerY: 500,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 500,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 600,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 460,
          playerY: 500,
        },
      ],
    },
    {
      baseFormatName: 'FK - Deep',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 150,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 510,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'DM',
          playerX: 330,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 200,
          playerY: 480,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 460,
          playerY: 480,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 620,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 720,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 620,
        },
      ],
    },
    {
      baseFormatName: 'FK - Short - Centrally',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 270,
          playerY: 400,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 390,
          playerY: 400,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 550,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 650,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 520,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 550,
        },
      ],
    },
    {
      baseFormatName: 'FK - Short - From Wings',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 330,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 480,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 480,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 600,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 700,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 600,
        },
      ],
    },
    {
      baseFormatName: 'Throw-In - Attacking Third',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 380,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 380,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 520,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 620,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 480,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 520,
        },
      ],
    },
    {
      baseFormatName: 'Throw-In - Middle Third',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 350,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 350,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 480,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 580,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 440,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 480,
        },
      ],
    },
    {
      baseFormatName: 'Throw-In - Defending Third',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'DM',
          playerX: 330,
          playerY: 300,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 220,
          playerY: 400,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'CM',
          playerX: 440,
          playerY: 400,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 500,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 600,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 500,
        },
      ],
    },
    {
      baseFormatName: 'Defending - High Block',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 150,
          playerY: 250,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 250,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 250,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 510,
          playerY: 250,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 220,
          playerY: 380,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 440,
          playerY: 380,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 120,
          playerY: 500,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 520,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'LW',
          playerX: 540,
          playerY: 500,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 580,
        },
      ],
    },
    {
      baseFormatName: 'Defending - Middle Block',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'CM',
          playerX: 250,
          playerY: 380,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'CM',
          playerX: 410,
          playerY: 380,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 150,
          playerY: 520,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 620,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'LW',
          playerX: 510,
          playerY: 520,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'CAM',
          playerX: 330,
          playerY: 480,
        },
      ],
    },
    {
      baseFormatName: 'Defending - Low Block',
      baseFormatPositions: [
        {
          playerNumber: 1,
          playerPositionAbbrev: 'GK',
          playerX: 330,
          playerY: 100,
        },
        {
          playerNumber: 2,
          playerPositionAbbrev: 'RB',
          playerX: 180,
          playerY: 200,
        },
        {
          playerNumber: 5,
          playerPositionAbbrev: 'CB',
          playerX: 280,
          playerY: 200,
        },
        {
          playerNumber: 4,
          playerPositionAbbrev: 'CB',
          playerX: 380,
          playerY: 200,
        },
        {
          playerNumber: 3,
          playerPositionAbbrev: 'LB',
          playerX: 480,
          playerY: 200,
        },
        {
          playerNumber: 6,
          playerPositionAbbrev: 'DM',
          playerX: 300,
          playerY: 400,
        },
        {
          playerNumber: 8,
          playerPositionAbbrev: 'DM',
          playerX: 360,
          playerY: 400,
        },
        {
          playerNumber: 7,
          playerPositionAbbrev: 'RW',
          playerX: 180,
          playerY: 550,
        },
        {
          playerNumber: 9,
          playerPositionAbbrev: 'ST',
          playerX: 330,
          playerY: 700,
        },
        {
          playerNumber: 10,
          playerPositionAbbrev: 'LW',
          playerX: 480,
          playerY: 550,
        },
        {
          playerNumber: 11,
          playerPositionAbbrev: 'CM',
          playerX: 330,
          playerY: 480,
        },
      ],
    },
  ];

  constructor() {}

  /**
   * Get all field background options
   */
  getFieldBackgroundOptions(): IFieldBackgroundOption[] {
    return [...this.fieldBackgroundOptions];
  }

  /**
   * Get field background option by value
   */
  getFieldBackgroundByValue(value: string): IFieldBackgroundOption | undefined {
    return this.fieldBackgroundOptions.find((opt) => opt.value === value);
  }

  /**
   * Get path to field background image
   */
  getFieldBackgroundPath(value: string): string {
    const option = this.getFieldBackgroundByValue(value);
    return option
      ? `assets/field-grids/${option.file}`
      : 'assets/field-grids/field.standard.svg';
  }

  /**
   * Get all base formations
   */
  getBaseFormations(): IMiniMatchBaseFormat[] {
    return JSON.parse(JSON.stringify(this.baseFormationOptions)); // Return deep copy
  }

  /**
   * Get base formation by name
   */
  getBaseFormationByName(name: string): IMiniMatchBaseFormat | undefined {
    return this.baseFormationOptions.find((f) => f.baseFormatName === name);
  }

  /**
   * Get list of all formation names
   */
  getFormationNames(): string[] {
    return this.baseFormationOptions.map((f) => f.baseFormatName);
  }
}
