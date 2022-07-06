import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-buyappalert',
  templateUrl: './buyappalert.page.html',
  styleUrls: ['./buyappalert.page.scss']
})
export class BuyappalertPage implements OnInit {
  isLoading: boolean;

  constructor(private modalController: ModalController, private http: HttpClient,
    private translate: TranslateService, private loadingController: LoadingController) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss();
  }

  buyAppAction() {
    this.modalController.dismiss();
    window.open("http://bit.ly/cc_WooChat", '_system', 'location=no');
  }

  navWhatsapp() {
    let projectName = "WooChat";
    this.http.get<any>("https://dashboard.vtlabs.dev/whatsapp.php?product_name=" + projectName + "&source=ionic_template", {
      headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
    }).subscribe(res => {
      window.open(res['link'], '_system', 'location=no');
    }, err => { });

    this.dismiss();
  }

  async presentLoading(body: string) {
    this.isLoading = true;
    return await this.loadingController.create({ message: body }).then(overlay => {
      overlay.present().then(() => {
        if (!this.isLoading) {
          try {
            overlay.dismiss().then(() => console.log('loading aborted'));
          } catch (error) {
            console.log(error);
          }
        }
      });
    });
  }

  async dismissLoading() {
    this.isLoading = false;
    try {
      return await this.loadingController.dismiss();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}
