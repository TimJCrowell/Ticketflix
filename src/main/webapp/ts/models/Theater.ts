export interface TheaterData {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

export class Theater {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly address: string;

  constructor(data: TheaterData) {
    this.id      = data.id;
    this.name    = data.name;
    this.city    = data.city    ?? '';
    this.address = data.address ?? '';
  }
}
