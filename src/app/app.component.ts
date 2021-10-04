import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxPouchDBService } from 'projects/ngx-pouch-db/src/lib/ngx-pouchdb.service';
import { NgxPouchDBEvents } from 'projects/ngx-pouch-db/src/public_api';
import { BehaviorSubject, of } from 'rxjs';
import { delay, flatMap } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    structureDoc: Object;
    blueEyesPeople: Object[] = [];
    allData: Object[] = [];
    idToDelete: string;
    revToDetelete: string;
    syncPending: boolean;
    synced: boolean;

    step = 1;

    public mockDatas = [
        {
            age: 18,
            eyeColor: 'blue',
            name: {
                first: 'Dark',
                last: 'Vador'
            }
        },
        {
            age: '45',
            eyeColor: 'red',
            name: {
                first: 'Charles',
                last: 'Charmichael'
            }
        },
        {
            age: '42',
            eyeColor: 'blue',
            name: {
                first: 'Pablo',
                last: 'Montoya'
            }
        }
    ];

    public listDatas = [];

    constructor(private ngxPouchDBService: NgxPouchDBService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        NgxPouchDBEvents.synced.subscribe(data => {
            this.synced = data;
        });
        NgxPouchDBEvents.syncPending.subscribe(data => {
            this.syncPending = data;
        })


        this.getData();
        NgxPouchDBEvents.changes.subscribe(data => {
            this.getData();
        })
    }

    getData() {
        this.ngxPouchDBService.find('main', {
            'selector': {
                '_id': {
                    '$gt': null
                }
            }
        })
            .subscribe((response) => {
                this.listDatas = response.docs;
                this.cdr.detectChanges();
            });
    }


    isPut = false;
    isDelete = false;

    // put data into the database
    putData(data) {
        this.ngxPouchDBService.create('main', data)
            .subscribe(() => {
                this.getData();
            });
    }

    deleteData(document) {
        this.ngxPouchDBService.remove('main', document)
        .subscribe(() => {
            this.getData();
        });
    }

    deleteDatabase(local: boolean = true, remote: boolean = true) {
        this.ngxPouchDBService.removeDatabase('main', local, remote).subscribe((response) => {
            console.log('Database removed', response);
        });

        this.isDelete = true;
    }

    // getting the document with the id 'c5...' and putting the result into a string
    getSimpleDocument() {
        this.ngxPouchDBService.get('main', 'c5bc6467b3ac9d1140547d25f70049f7').subscribe((data) => {
            this.structureDoc = JSON.stringify(data);
        });
    }

    // finding all documents with eyeColar equaling blue
    findNameByEyeColor() {
        this.ngxPouchDBService.find('main',
            {
                'selector': {
                    'eyeColor': {
                        '$eq': 'blue'
                    }
                }
            }).subscribe((data) => {
                this.blueEyesPeople = data.docs;
            });
    }

    refresh() {
        console.log('refresh');
        this.ngxPouchDBService.sync('main', false);
    }
}
