import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuctionsService } from '../../../../../shared/services/auctions.service';

@Component({
  selector: 'app-change-auction-name',
  templateUrl: './change-auction-name.component.html',
  styleUrls: ['../../../../../../assets/styles/input-with-labels.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAuctionNameComponent implements OnInit {
  auctionName: FormControl = new FormControl('', [Validators.required]);
  loading = false;
  constructor(
    private auctionService: AuctionsService,

    @Inject(MAT_DIALOG_DATA)
    public data: { auctionId: string },
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ChangeAuctionNameComponent>
  ) {}

  ngOnInit(): void {}

  // handles the alias name change of an auction
  changeName() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (this.auctionName.invalid) {
      this.auctionName.markAsTouched();
      this.loading = false;
      return;
    }

    this.auctionService
      .changeAuctionName(this.data.auctionId, this.auctionName.value)
      .then((teamRef) => {
        this.snackBar.open(`Name changed`, null, {
          duration: 5000,
        });
        this.dialogRef.close();
      })
      .catch((err) => {
        this.snackBar.open(`The name couldn't be changed`, null, {
          duration: 5000,
        });
        this.loading = false;
      });
  }
}
