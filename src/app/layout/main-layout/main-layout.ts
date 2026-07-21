import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';

import { Toolbar } from '../../shared/ui/toolbar/toolbar';
import { Sidenav } from '../../shared/ui/sidenav/sidenav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MatSidenavModule, Sidenav, Toolbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
