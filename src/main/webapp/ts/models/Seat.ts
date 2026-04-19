export type SeatStatus = 'available' | 'selected' | 'taken';

export interface SeatData {
  row: string;
  col: number;
  status: SeatStatus;
}

export class Seat {
  row: string;
  col: number;
  status: SeatStatus;

  constructor(data: SeatData) {
    this.row    = data.row;
    this.col    = data.col;
    this.status = data.status;
  }

  get label(): string {
    return `${this.row}${this.col}`;
  }

  toggle(): void {
    if (this.status === 'available') {
      this.status = 'selected';
    } else if (this.status === 'selected') {
      this.status = 'available';
    }
  }
}
