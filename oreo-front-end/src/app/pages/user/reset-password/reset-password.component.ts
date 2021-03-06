import { Component } from '@angular/core';
import { ResetPasswordService } from './reset-password.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['reset-password.component.scss'],
  providers: [ResetPasswordService],
})
export class AppResetPasswordComponent {
  constructor(
    private service: ResetPasswordService
  ) {
  }
}
