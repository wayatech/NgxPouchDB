import { Component, OnInit, Input } from '@angular/core';
import PouchDB from 'pouchdb';
import { NgxPouchDBService } from 'projects/ngx-pouch-db/src/lib/ngx-pouchdb.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    structureDoc: Object;
    blueEyesPeople: Object[] = [];
    allData: Object[] = [];
    idToDelete: string;
    revToDetelete: string;

    toPutInDataBase = {
        age: '',
        eyeColor: '',
        name: {
            first: '',
            last: ''
        },
        favoriteFruit: ''
    };

    constructor(private ngxPouchDBService: NgxPouchDBService) {}


    isPut = false;
    isDelete = false;

    // put data into the database
    putData() {
        this.ngxPouchDBService.create('main', this.toPutInDataBase).subscribe(() => {
            this.ngxPouchDBService.find('main', {
                'selector': {
                    '_id': {
                       '$gt': null
                    }
                 }
            }).subscribe((data) => {
                this.allData = data.docs;
            });
        });
        this.isPut = true;
    }

    deleteData(document) {
        this.ngxPouchDBService.remove('main', document).subscribe(() => {
            this.ngxPouchDBService.find('main', {
                'selector': {
                    '_id': {
                       '$gt': null
                    }
                 }
            }).subscribe((data) => {
                this.allData = data.docs;
            });
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

    ngOnInit() {
        this.ngxPouchDBService.init(
            'main',
            this.ngxPouchDBService.createDatabase('ngxpouchdb', {auto_compaction: true}),
            this.ngxPouchDBService.createDatabase('http://localhost:5984/ngxpouchdb', {
                skip_setup: true,
                // @ts-ignore
                fetch (url, opts) {
                    opts.credentials = 'include';

                    // @ts-ignore
                    return PouchDB.fetch(url, opts);
                },
            }),
            {}
        );

       this.getSimpleDocument();
       this.findNameByEyeColor();
    }
}
