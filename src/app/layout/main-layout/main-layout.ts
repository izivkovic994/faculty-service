import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';

import { PageFooterComponent } from '../../shared/ui/page-footer/page-footer';
import { SidenavComponent } from '../../shared/ui/sidenav/sidenav';
import { ToolbarComponent } from '../../shared/ui/toolbar/toolbar';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    SidenavComponent,
    ToolbarComponent,
    PageFooterComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {}
