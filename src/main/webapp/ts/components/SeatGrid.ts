import { Seat } from '../models/Seat.js';

export class SeatGrid {
  private grid: Seat[][];
  private onChange: (selected: Seat[]) => void;

  constructor(grid: Seat[][], onChange: (selected: Seat[]) => void) {
    this.grid     = grid;
    this.onChange = onChange;
  }

  render(container: HTMLElement): void {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'seat-grid';

    // Screen curve
    const screen = document.createElement('div');
    screen.className = 'seat-grid__screen';
    screen.innerHTML = '<span>SCREEN</span>';
    wrapper.appendChild(screen);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'seat-legend';
    legend.innerHTML = `
      <span class="seat-legend__item"><span class="seat seat--available"></span>Available</span>
      <span class="seat-legend__item"><span class="seat seat--selected"></span>Selected</span>
      <span class="seat-legend__item"><span class="seat seat--taken"></span>Taken</span>
    `;
    wrapper.appendChild(legend);

    // Rows
    this.grid.forEach(rowSeats => {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      const rowLabel = document.createElement('span');
      rowLabel.className = 'seat-row__label';
      rowLabel.textContent = rowSeats[0].row;
      rowEl.appendChild(rowLabel);

      rowSeats.forEach(seat => {
        const btn = document.createElement('button');
        btn.className = `seat seat--${seat.status}`;
        btn.disabled  = seat.status === 'taken';
        btn.title     = seat.label;

        btn.addEventListener('click', () => {
          seat.toggle();
          btn.className = `seat seat--${seat.status}`;
          this.onChange(this.getSelected());
        });

        rowEl.appendChild(btn);
      });

      wrapper.appendChild(rowEl);
    });

    container.appendChild(wrapper);
  }

  getSelected(): Seat[] {
    const all: Seat[] = [];
    this.grid.forEach(row => row.forEach(s => { if (s.status === 'selected') all.push(s); }));
    return all;
  }
}
