import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';

// models
import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { Seller } from '@shared/models/seller.model';

// services
import { SellerService } from '@shared/services/seller.service';

// rxjs
import { Observable } from 'rxjs';

@Component({
  selector: 'app-seller-card',
  templateUrl: './seller-card.component.html',
})
export class SellerCardComponent implements OnInit {
  deleting = false;
  @Input() sellerId: string;
  @Input() canBeDeleted: boolean = false;
  @Input() role: TeamMemberRoleEnum | null = null;
  @Output() removeMember: EventEmitter<void> = new EventEmitter<void>();
  seller$: Observable<Seller>;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.seller$ = this.sellerService.getSellerById(this.sellerId);
  }

  // get image from seller objs
  getImage(seller: Seller) {
    if (!seller.profilePhotoURI) {
      return `background-image: url('assets/images/empty.jpg')`;
    } else {
      return `background-image: url('${seller.profilePhotoURI}')`;
    }
  }

  // extract initals from a given seller
  getInitials(seller: Seller) {
    let initials = '';

    if (seller.firstName) {
      initials += seller.firstName[0].toUpperCase();
    }

    if (seller.lastName) {
      initials += seller.lastName[0].toUpperCase();
    }

    return initials ? initials : 'N/A';
  }

  // emits event when (x) button is clicked by the user
  remove() {
    this.removeMember.emit();
    this.deleting = true;
    setTimeout(() => {
      this.deleting = false;
    }, 5000);
  }
}
