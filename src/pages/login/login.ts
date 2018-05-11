import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthData } from '../../models/auth-data.interface';
import { UtilProvider } from '../../providers/util/util';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage({
  name: 'login'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit {

  userForm: FormGroup;
  fetchingData: boolean;  
  showPwd: boolean = false;
  pwdType: string = "password";
  pwdIcon: string = "md-eye-off";

  constructor(public form: FormBuilder, public util: UtilProvider,
    public authService: AuthProvider, public navCtrl: NavController) {}

  ngOnInit() {
    this.userForm = this.form.group({
      password: ['', Validators.compose([Validators.maxLength(20), Validators.minLength(3), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      email: ['', Validators.compose([Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'), Validators.required])]
    });
  }

  showHidePassword() {
    this.showPwd = !this.showPwd;
    if(this.showPwd) {
      this.pwdType = 'text';
      this.pwdIcon = 'md-eye-off';
    } else {
      this.pwdType = 'password';
      this.pwdIcon = 'md-eye';
    }
  }

  login() {
    this.fetchingData = true; 
    let authData: AuthData = { email: this.userForm.value.email, password: this.userForm.value.password };
    this.authService.loginWithCredentials(authData)
      .then(result => {
        this.fetchingData = false; 
        this.util.presentToast('Je bent nu ingelogd', 'bottom'); 
        this.navCtrl.setRoot('snaps'); 
      })
      .catch(err => {
        this.fetchingData = false; 
        this.util.presentToast(err.message, 'bottom'); 
      });
  }

}
