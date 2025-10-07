import { Component, input } from '@angular/core';

@Component({
  selector: 'div[card]',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    '[class.shadow]': "config() === 'shadow'",
    '[class.summary-card]': "config() === 'summary'",
    '[className]': "cardType()",
  },
})
export class CardComponent {
  config = input<'' | 'shadow' | 'summary'>('', {
    alias: 'card',
  });

  cardType = input<
    '' | 'primary' | 'secondary' | 'warning' | 'error' | 'purple' | 'success' | 'pink' | 'red'
  >('', {
    alias: 'type',
  });
}
