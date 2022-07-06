import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { APP_CONFIG, AppConfig } from '../app.config';
import { BuyappalertPage } from '../buyappalert/buyappalert.page';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private route: Router, private modalController: ModalController) { }

  ngOnInit() {
  }

  myprofile() {
    this.route.navigate(['./my-profile']);
  }
  privacy() {
    this.route.navigate(['./privacy-setting']);
  }
  chatsetting() {
    this.route.navigate(['./chat-setting']);
  }
  change_language() {
    this.route.navigate(['./change-language']);
  }
  notificationsetting() {
    this.route.navigate(['./notification-setting']);
  }
  buyAppAction() {
    this.modalController.create({ component: BuyappalertPage }).then((modalElement) => modalElement.present());
  }
  developed_by() {
    window.open("https://opuslab.works/", '_system', 'location=no');
  }

}
