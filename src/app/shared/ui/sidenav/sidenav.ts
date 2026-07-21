import { Component } from '@angular/core';

import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-sidenav',
  imports: [MatListModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {}
