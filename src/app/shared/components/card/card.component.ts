import { CardType, CardVariant } from '@/shared/types';
import { Component, input } from '@angular/core';

@Component({
  selector: 'div[card]',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  host: {
    '[class.shadow]': "cardType() === 'shadow'",
    '[class.summary-card]': "cardType() === 'summary'",
    '[className]': 'variant()',
  },
})
export class CardComponent {
  cardType = input<CardType>('', {
    alias: 'card',
  });

  variant = input<CardVariant>('', {
    alias: 'type',
  });
}
