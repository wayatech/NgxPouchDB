import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { DatabaseSettings } from './models/database';

import { NgxPouchDBService } from './ngx-pouchdb.service';

export class NgxPouchDBConfig {
    databases: {key: string, localDB: string, remoteDB: string, settings?: DatabaseSettings}[];
}


@NgModule({
    imports: [
    ],
    declarations: [],
    exports: []
})
export class NgxPouchdbModule {
    constructor (@Optional() @SkipSelf() parentModule: NgxPouchdbModule, config: NgxPouchDBConfig, pouch: NgxPouchDBService) {
        if (parentModule) {
            throw new Error('NgxPouchdbModule is already loaded. Import it in the AppModule only');
        } else {
            config.databases.forEach(database => {
                pouch.init(
                    database.key,
                    pouch.createDatabase(database.localDB, {auto_compaction: true}),
                    pouch.createDatabase(database.remoteDB, {
                        skip_setup: true,
                        // @ts-ignore
                        fetch (url, opts) {
                            opts.credentials = 'include';

                            // @ts-ignore
                            return PouchDB.fetch(url, opts);
                        },
                    }),
                    database.settings
                )
            })
        }
    }

    static forRoot(config: NgxPouchDBConfig): ModuleWithProviders {
        return {
            ngModule: NgxPouchdbModule,
            providers: [
                { provide: NgxPouchDBConfig, useValue: config },
            ]
        };
    }
}
