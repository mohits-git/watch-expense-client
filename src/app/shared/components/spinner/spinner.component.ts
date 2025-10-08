import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  imports: [NgClass],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})

export class SpinnerComponent {
  size = input<"small" | "medium" | "large">("medium");
}
