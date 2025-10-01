import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from "primeng/toast"
import { HeaderComponent } from './shared/components/header/header.component';
import { ContainerComponent } from './shared/components/container/container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, HeaderComponent, ContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
