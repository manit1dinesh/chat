import { Component, OnInit } from '@angular/core';
import * as firebaseui from 'firebaseui';
import firebase from 'firebase/compat/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataSharingService } from '../services/data-sharing.service';

@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.page.html',
  styleUrls: ['./social-login.page.scss'],
})
export class SocialLoginPage implements OnInit {
  constructor(private router: Router, private dataSharingService: DataSharingService) { }

  ngOnInit() {
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return true;
        },
        uiShown: function () {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById('loader').style.display = 'none';
        }
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: 'redirect',
      signInSuccessUrl: '/',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      // Terms of service url.
      tosUrl: '<your-tos-url>',
      // Privacy policy url.
      privacyPolicyUrl: '<your-privacy-policy-url>'
    };
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
    
    const auth = firebase.auth();
    auth.onAuthStateChanged(user => {
      console.log(user.displayName);
      console.log(user.uid);
      this.dataSharingService.userData.next(user.uid);
      this.router.navigate(['sign-in']);
    });
  }

  routeToPath(){
    this.router.navigate(['sign-in']);
  };

}
