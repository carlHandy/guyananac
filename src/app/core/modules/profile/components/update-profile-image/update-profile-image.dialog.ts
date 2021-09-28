import { Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// firebase
import { AngularFireStorage } from '@angular/fire/storage';

// rxjs
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// services
import { AuthService } from '../../../../../shared/services/auth.service';
import { SellerService } from '../../../../../shared/services/seller.service';

interface DialogData {
  base: string;
}

@Component({
  selector: 'app-update-profile-image',
  templateUrl: './update-profile-image.dialog.html',
  styleUrls: ['./update-profile-image.dialog.scss'],
})
export class UpdateProfileImageDialog {
  image: File;
  imagePreview: string | ArrayBuffer;
  progress$: Observable<number>;
  progress = 0;
  completed = false;
  updating = false;
  taskSub: Subscription;
  maxSizeBytes = 3000000;
  errorMessage = '';

  constructor(
    private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<UpdateProfileImageDialog>,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private sellerService: SellerService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnDestroy(): void {
    if (this.taskSub) {
      this.taskSub.unsubscribe();
    }
  }

  // handles the selection of the image file for the input
  onImageSelection(event: any): void {
    this.errorMessage = '';
    this.imagePreview = '';
    this.image = null;
    const imageFile = event.target?.files[0];

    if (!imageFile) {
      return;
    }

    if (imageFile.size > this.maxSizeBytes) {
      this.errorMessage = `The image size is too big, please select an image under ${
        this.maxSizeBytes / 1000000
      }MB`;

      return;
    }

    this.progress = 0;
    this.completed = false;
    this.generatePreview(imageFile);
    this.image = imageFile;
  }

  // generates a preview of the selected image
  generatePreview(image: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => (this.imagePreview = reader.result);
  }

  // uploads the image to firebase storage
  update(): void {
    if (!this.image) {
      return;
    }
    this.updating = true;
    this.completed = false;

    const date = new Date(Date.now());
    const uid = this.authService.baseUser.uid;
    const path = `${this.data.base}/${date.getDate()}${uid} `;
    const fileRef = this.storage.ref(path);
    const task = this.storage.upload(path, this.image);

    this.progress$ = task.percentageChanges();

    this.taskSub = task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          const sub = fileRef.getDownloadURL().subscribe((url) => {
            this.snackBar.open('Profile image uploaded', null, {
              duration: 5000,
            });
            this.completed = true;
            this.updating = false;
            sub.unsubscribe();
            this.dialogRef.close({
              url,
            });
          });
        })
      )
      .subscribe(
        () => {},
        (err) => {
          this.snackBar.open('Error uploading the image', null, {
            duration: 5000,
          });
        }
      );
  }

  // removes user image
  removeUserImage() {
    this.dialogRef.close({
      removeImage: true,
    });
  }
}
