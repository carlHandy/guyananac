import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  message: string;
}

@Component({
  templateUrl: './confirmation.dialog.html',
})
export class ConfirmationDialog implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
    private dialogRef: MatDialogRef<ConfirmationDialog>
  ) {}

  ngOnInit(): void {}

  // closes dialog with negative confirmation
  reject() {
    this.dialogRef.close();
  }

  // closes the dialog with positive confirmation
  accept() {
    this.dialogRef.close({
      confirm: true,
    });
  }
}
