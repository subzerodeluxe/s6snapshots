import { Injectable } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { Snapshot } from '../../models/snapshot.interface';
import firebase from 'firebase/app';
import 'firebase/storage';
//import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Injectable()
export class SnapshotProvider {

  private firebaseSubscriptions: Subscription[] = []; 
  snapshotsChanged = new Subject<Snapshot[]>();
  private fetchedSnapshots: Snapshot[] = []; 
  //task: AngularFireUploadTask;

  constructor(public db: AngularFirestore) { }

  fetchSnapshots() {
    this.firebaseSubscriptions.push(this.db.collection('snapshots')
      .snapshotChanges()
      .map(docArray => {
        return docArray.map(doc => {
          return {
            id: doc.payload.doc.id,
            title: doc.payload.doc.data().title,
            image: doc.payload.doc.data().image,
            summary: doc.payload.doc.data().summary,
            tags: doc.payload.doc.data().tags,
            date: doc.payload.doc.data().date
          };
        }); 
      }).subscribe((snapshots: Snapshot[]) => {
        console.log(snapshots); 
        this.fetchedSnapshots = snapshots;
        this.snapshotsChanged.next([...this.fetchedSnapshots]);
      })
    );
  }

  cancelSubscriptions() {
    this.firebaseSubscriptions.forEach(sub => sub.unsubscribe()); 
  }

  encodeImageUri(imageUri, callback) {
    var c = document.createElement('canvas');
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function () {
      var aux:any = this;
      c.width = aux.width;
      c.height = aux.height;
      ctx.drawImage(img, 0, 0);
      var dataURL = c.toDataURL("image/jpeg");
      callback(dataURL);
    };
    img.src = imageUri;
  };

  uploadImage(imageURI){
    return new Promise<any>((resolve, reject) => {
      
      const docId = this.db.createId(); // generates random id for document
      const path = `${docId}.jpg`;  // set the path (id + .jpg)

      const storageRef = firebase.storage().ref(path);
      
      storageRef.putString(imageURI, 'data_url')
      .then(snapshot => {
            resolve(snapshot.downloadURL)
          }, err => {
            reject(err);
          });
      // this.encodeImageUri(imageURI, function(image64){
      //   storageRef.putString(image64, 'data_url')
      //   .then(snapshot => {
      //     resolve(snapshot.downloadURL)
      //   }, err => {
      //     reject(err);
      //   })
      // })
    })
  }

 

  // uploadImage(imageString) {
  
  //   const docId = this.db.createId(); // generates random id for document
  //   const path = `${docId}.jpg`;  // set the path (id + .jpg)
  
  //   this.task = this.storage.ref(path).putString(imageString, 'data_url');
  //   return this.task; 
  // }

  updateDatabase(snapshotId, snapshotObject) {
    return this.db.collection('snapshots').doc(snapshotId).set(snapshotObject); 
  }

  addToDatabase(snapshotObject) {
    return this.db.collection('snapshots').add(snapshotObject); 
  }

  deleteSnapshot(snapshotId) {
    //console.log('Binnengekomen id: ', snapshotId); 
    return this.db.collection('snapshots').doc(snapshotId).delete(); 
  }

}
