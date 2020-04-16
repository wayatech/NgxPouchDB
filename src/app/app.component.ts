import { Component, OnInit } from '@angular/core';
import { NgxPouchDBService } from 'projects/ngx-pouch-db/src/lib/ngx-pouchdb.service';
import { flatMap } from 'rxjs/operators';

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

    constructor(private ngxPouchDBService: NgxPouchDBService) { }

    ngOnInit() {
        this.ngxPouchDBService.find('main', {
            'selector': {
                '_id': {
                    '$gt': null
                }
            }
        })
            .subscribe((response) => {
                this.listDatas = response.docs;
            });
    }


    isPut = false;
    isDelete = false;

    // put data into the database
    putData(data) {
        this.ngxPouchDBService.create('main', data)
            .pipe(flatMap(inner => this.ngxPouchDBService.find('main', {
                'selector': {
                    '_id': {
                        '$gt': null
                    }
                }
            })))
            .subscribe((response) => {
                this.listDatas = response.docs;
            });
    }

    deleteData(document) {
        this.ngxPouchDBService.remove('main', document)
            .pipe(flatMap(inner => this.ngxPouchDBService.find('main', {
                'selector': {
                    '_id': {
                        '$gt': null
                    }
                }
            })))
            .subscribe((response) => {
                this.listDatas = response.docs;
            });
    }

    deleteDatabase() {
        this.ngxPouchDBService.removeDatabase('main', true, true).subscribe((response) => {
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
}
