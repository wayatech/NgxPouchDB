import { Component, OnInit } from '@angular/core';
import PouchDB from 'pouchdb';
import { NgxPouchDBService } from 'projects/ngx-pouch-db/src/lib/ngx-pouchdb.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private ngxPouchDBService: NgxPouchDBService) {}

    ngOnInit() {
        this.ngxPouchDBService.init(
            'main',
            this.ngxPouchDBService.createDatabase('demo', {auto_compaction: true}),
            this.ngxPouchDBService.createDatabase('http://localhost:5984/demo', {
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

        this.ngxPouchDBService.put('main', {test: 1});
    }
}
