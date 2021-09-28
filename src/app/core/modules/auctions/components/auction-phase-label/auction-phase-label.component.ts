import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AuctionPhaseTextEnum } from '@shared/enums/auction-phase-text.enum';

@Component({
  selector: 'app-auction-phase-label',
  templateUrl: './auction-phase-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionPhaseLabelComponent {
  @Input() phase: AuctionPhaseTextEnum;
  phases = AuctionPhaseTextEnum;
  constructor() {}
}
