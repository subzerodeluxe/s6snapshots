import { Injectable } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Snapshot } from '../../models/snapshot.interface';
import * as firebase from 'firebase/app';
import { UtilProvider } from '../util/util';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';
import { tap } from 'rxjs/operators';

@Injectable()
export class SnapshotProvider {

  private firebaseSubscriptions: Subscription[] = []; 
  snapshotsChanged = new Subject<Snapshot[]>();
  private fetchedSnapshots: Snapshot[] = []; 
  task: AngularFireUploadTask;

  constructor(public db: AngularFirestore, public util: UtilProvider, private storage: AngularFireStorage) { }

  fetchSnapshots() {
    this.firebaseSubscriptions.push(this.db.collection('snapshots', ref => 
      ref.orderBy('createdAt', 'desc').limit(20)
    )
      .snapshotChanges()
      .map(docArray => {
        return docArray.map(doc => {
          return {
            id: doc.payload.doc.id,
            title: doc.payload.doc.data().title,
            image: doc.payload.doc.data().image,
            summary: doc.payload.doc.data().summary,
            tags: doc.payload.doc.data().tags,
            createdAt: doc.payload.doc.data().createdAt
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

  
  // uploadImage(imageURI){
  //   this.util.presentToast(JSON.stringify(imageURI), 'bottom'); 
  //     const docId = this.db.createId(); // generates random id for document
  //     const path = `${docId}.jpg`;  // set the path (id + .jpg)
  //     return new Promise<any>((resolve, reject) => {
  //       let storageRef = firebase.storage().ref();
  //       let imageRef = storageRef.child('snapshots').child(path);
  //       this.encodeImageUri(imageURI, function(image64){
  //         imageRef.putString(image64, 'data_url')
  //         .then(snapshot => {
  //           resolve(snapshot.downloadURL)
  //         }, err => {
  //           reject(err);
  //         })
  //       })
  //     })
  // }

  startUpload(file: string): Promise<any> {
    this.util.presentToast('Bezig met het uploaden van de afbeelding', 'bottom');
    
    const docId = this.db.createId();
    const path = `${docId}.jpg`;

    this.task = this.storage.ref(path).putString(file, 'data_url');

    return new Promise<any>((resolve, reject) => {
      this.task.downloadURL().pipe(
        tap(photoURL => {
          const uploadedImage = photoURL;
          resolve(uploadedImage);  
        }, err => {
          reject(err);
        }) 
      )
    }) 
  }

 
  updateDatabase(snapshotId, snapshotObject: Snapshot) {
    return this.db.collection('snapshots').doc(snapshotId).set(snapshotObject); 
  }

  addToDatabase(snapshotObject: Snapshot) {
    //return this.db.collection('snapshots').add(snapshotObject); 
    const createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const newSnapshot = { createdAt, ...snapshotObject };
    return this.db.collection('snapshots').add(newSnapshot); 
  }

  deleteSnapshot(snapshotId) {
    //console.log('Binnengekomen id: ', snapshotId); 
    return this.db.collection('snapshots').doc(snapshotId).delete(); 
  }

}
