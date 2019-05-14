import { EventEmitter, Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import LoginPlugin from 'pouchdb-authentication';
import FindPlugin from 'pouchdb-find';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import uuidv4 from 'uuid/v4';

import { Database } from './models/database';

@Injectable({
    providedIn: 'root'
})
export class NgxPouchDBService {
    public static syncPending: EventEmitter<boolean> = undefined;

    public static user: any = undefined;
    public databases: { [key: string]: Database; } = {};

    public static isLogged() {
        return NgxPouchDBService.user !== undefined;
    }

    public constructor() {
        NgxPouchDBService.syncPending = new EventEmitter;

        PouchDB.plugin(FindPlugin);
        PouchDB.plugin(LoginPlugin);
    }

    public init(key: string, localDB: PouchDB.Database, remoteDB: PouchDB.Database, sync) {
        if (Object.keys(this.databases).length === 0 && key !== 'main') {
            throw new Error('First database must named "main"');
        }

        this.databases[key] = new Database(localDB, remoteDB, sync);

        this.databases[key].syncPending.subscribe(() => {
            this.checkAllSync();
        });
    }

    public createDatabase(name: string, options: Object) {
        return new PouchDB(name, options);
    }


    public get(key: string, id: string) {
        return from(this.databases[key].get(id));
    }

    public put(key: string, document: any) {
        return from(this.databases[key].put(document)).pipe(map(data => { document._rev = data['rev']; return data; }));
    }

    public remove(key: string, document: any) {
       // console.log(document);

        return from(this.databases[key].remove(document));
    }

    public create(key: string, document: any) {
        if (!document._id) {
            document._id = uuidv4();
        }

        return this.put(key, document).pipe(map(data => {
            delete(document._id);
            delete(document._rev);
        }));
    }

    public find(key: string, filter) {
        PouchDB.plugin(FindPlugin);

        return from(this.databases[key].find(filter));
    }

    public query(key: string, view: string, queryParams) {
        return this.databases[key].query(view, queryParams);
    }

        public replicateFromRemote(key: string) {
            return this.databases[key].replicateFromRemote();
        }

    public sync(key: string, live: boolean = false, liveAfterSync: boolean = false) {
        return this.databases[key].sync()
            .on('complete', () => {
                if (!live && liveAfterSync) {
                    this.databases[key].sync(true, true);
                }
            })
        ;
    }

    private checkAllSync() {
        let sync = true;

        for (const key in this.databases) {
            if (!this.databases[key].synced) {
                sync = false;

                break;
            }
        }

        NgxPouchDBService.syncPending.emit(sync);
    }

    // User part
    public login(username: string, password: string) {
        const promise = this.databases['main'].remote.logIn(username, password);

        promise
            .then((session) => {
                return this.databases['main'].remote.getUser(session.name);
            })
            // .then((user) => {
            //     // this.setLocalUser(user);
            // })
        ;

        return promise;
    }
    public logout() {
        return this.databases['main'].remote.logOut()
            .then(() => {
                for (const key in this.databases) {
                    this.databases[key].syncEvent.cancel();
                }
            })
        ;
    }

    public getSession() {
        return this.databases['main'].remote.getSession()
            .then((session) => {
                if (session.userCtx.name === null) {
                    return null;
                }

                return this.databases['main'].remote.getUser(session.userCtx.name);
            })
            .then((user) => {
                return this.setLocalUser(user);
            })
        ;
    }

    public getLocalSession() {
        return this.databases['main'].local.get('_local/me');
    }

    private setLocalUser(remoteUser) {
        return this.databases['main'].local.get('_local/me')
            .then((localUser) => {
                const user = remoteUser;
                user._id = localUser._id;
                user._rev = localUser._rev;

                return this.databases['main'].local.put(user);
            }, () => {
                const user = remoteUser;
                user._id = '_local/me';
                user._rev = null;

                return this.databases['main'].local.put(user);
            })
            .then(() => {
                return this.databases['main'].local.get('_local/me');
            })
            .then(localUser => {
                return NgxPouchDBService.user = localUser;
            })
        ;
    }

    public putUser(metadata: object) {
        return this.databases['main'].remote.putUser(NgxPouchDBService.user.name, {
            metadata: metadata
        });
    }
}
