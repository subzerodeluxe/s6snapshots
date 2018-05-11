import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthData } from '../../models/auth-data.interface';

@Injectable()
export class AuthProvider {

  constructor(public ngAuth: AngularFireAuth) { }

  loginWithCredentials(authData: AuthData) {
   return this.ngAuth.auth.signInWithEmailAndPassword(authData.email, authData.password);
  }

  logOut() {
    return this.ngAuth.auth.signOut(); 
  }
}