import { Component, input } from '@angular/core';

@Component({
  selector: 'div[card]',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    "[class.shadow]": "config() === 'shadow'"
  }
})
export class CardComponent {
  config = input<string>('', {
    alias: 'card',
  });
}
