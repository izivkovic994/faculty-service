import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';

import { ToolbarComponent } from '../../shared/ui/toolbar/toolbar';
import { SidenavComponent } from '../../shared/ui/sidenav/sidenav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MatSidenavModule, SidenavComponent, ToolbarComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {}
