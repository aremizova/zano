import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {BackendService} from '../_helpers/services/backend.service';
import {VariablesService} from '../_helpers/services/variables.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import { WalletService } from '../_helpers/services/wallet.service';

@Component({
  selector: 'app-wallet-details',
  templateUrl: './wallet-details.component.html',
  styleUrls: ['./wallet-details.component.scss']
})
export class WalletDetailsComponent implements OnInit, OnDestroy {
  seedPhrase = '';
  showSeed = false;

  detailsForm = new FormGroup({
    name: new FormControl('', [Validators.required, (g: FormControl) => {
      for (let i = 0; i < this.variablesService.wallets.length; i++) {
        if (g.value === this.variablesService.wallets[i].name) {
          if (this.variablesService.wallets[i].wallet_id === this.variablesService.currentWallet.wallet_id) {
            return {'same': true};
          } else {
            return {'duplicate': true};
          }
        }
      }
      return null;
    }]),
    path: new FormControl('')
  });

  constructor(
    private router: Router,
    private backend: BackendService,
    public variablesService: VariablesService,
    private ngZone: NgZone,
    private location: Location,
    private walletService: WalletService,
  ) {}

  ngOnInit() {
    this.showSeed = false;
    this.detailsForm.get('name').setValue(this.variablesService.currentWallet.name);
    this.detailsForm.get('path').setValue(this.variablesService.currentWallet.path);
    this.backend.getSmartWalletInfo(this.variablesService.currentWallet.wallet_id, (status, data) => {
      if (data.hasOwnProperty('restore_key')) {
        this.ngZone.run(() => {
          this.seedPhrase = data['restore_key'].trim();
        });
      }
    });
  }

  showSeedPhrase() {
    this.showSeed = true;
  }

  onSubmitEdit() {
    if (this.detailsForm.value) {
      this.variablesService.currentWallet.name = this.detailsForm.get('name').value;
      this.ngZone.run(() => {
        this.router.navigate(['/wallet/' + this.variablesService.currentWallet.wallet_id]);
      });
    }
  }

  back() {
    this.location.back();
  }

  ngOnDestroy() {}

}
