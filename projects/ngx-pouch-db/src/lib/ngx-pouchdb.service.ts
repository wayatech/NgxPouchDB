import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import FindPlugin from 'pouchdb-find';
import { BehaviorSubject, defer, forkJoin, from, iif, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import uuidv4 from 'uuid/v4';

import { Database, DatabaseSettings } from './models/database';
import { NgxPouchDBEvents } from './ngx-pouchdb.events';

// import LoginPlugin from 'pouchdb-authentication';
@Injectable({
    providedIn: 'root'
})
export class NgxPouchDBService {
    public static user: any = undefined;
    public databases: { [key: string]: Database; } = {};

    public static isLogged() {
        return NgxPouchDBService.user !== undefined;
    }

    public constructor() {
        PouchDB.plugin(FindPlugin);
        // PouchDB.plugin(LoginPlugin);

        window.addEventListener('offline', () => {
            NgxPouchDBEvents.syncPending.next(false);
            NgxPouchDBEvents.synced.next(false);
        });
    }

    public init(key: string, localDB: PouchDB.Database, remoteDB: PouchDB.Database, settings: DatabaseSettings) {
        if (Object.keys(this.databases).length === 0 && key !== 'main') {
            throw new Error('First database must named "main"');
        }

        this.databases[key] = new Database(localDB, remoteDB, settings);

        this.databases[key].syncPending.subscribe(data => {
            this.checkAllSync();
            this.checkAllSyncPending();
        });
    }

    public db(key: string) {
        return this.databases[key];
    }

    public createDatabase(name: string, options: Object) {
        return new PouchDB(name, options);
    }

    public removeDatabase(key: string, local = true, remote = true) {
        if (!local && !remote) {
            throw new Error('You must pass local or remote to true to delete at least one database');
        }

        remote = false;
        return forkJoin({
            local: iif(() => local && !!this.databases[key].local, defer(() => from(this.databases[key].local.destroy())), of(null)),
            remote: iif(() => remote && !!this.databases[key].remote, defer(() => from(this.databases[key].remote.destroy())), of(null))
        })
            .pipe(tap(responses => {
                if (responses.local) {
                    this.databases[key].synced.next(false);
                    this.databases[key].local = null;
                }

                if (responses.remote) {
                    this.databases[key].remote = null;
                }

                if (!this.databases[key].local && !this.databases[key].remote) {
                    delete this.databases[key];
                }
            }));
    }

    public get(key: string, id: string, queryParams = {}) {
        return from(this.databases[key].get(id, queryParams));
    }

    public put(key: string, document: any, queryParams = {}) {
        return from(this.databases[key].put(document, queryParams)).pipe(map(data => { document._rev = data['rev']; return data; }));
    }

    public createIndex(key: string, object) {
        return from(this.databases[key].createIndex(object));
    }

    public remove(key: string, document: any) {
        return from(this.databases[key].remove(document));
    }

    public create(key: string, document: any) {
        if (!document._id) {
            document._id = uuidv4();
        }

        return from(this.put(key, document).pipe(map(data => {
            delete (document._id);
            delete (document._rev);
        })));
    }

    public find(key: string, filter) {
        PouchDB.plugin(FindPlugin);

        return from(this.databases[key].find(filter));
    }

    public query(key: string, view: string, queryParams = {}, overridePath?: Function) {
        return from(this.databases[key].query(view, queryParams))
            .pipe(map(data => data.rows))
            .pipe(map(data => {
                const tmp = {};

                data.forEach(el => {
                    this.nestedCreation(tmp, overridePath ? overridePath(el.key) : el.key, el.doc);
                });

                console.log(tmp)
                return Object.values(tmp);
            }))
            .pipe(tap(data => console.log(data)))
            ;
    }

    private nestedCreation(el: {}, path: string[], doc: {}) {
        if (path.length === 1) {
            if (/\[\]$/.test(path[0])) {
                const arrayPath = path[0].replace('[]', '');
                if (!el[arrayPath]) {
                    el[arrayPath] = [];
                }

                // @ts-ignore
                el[arrayPath].push(doc);
            } else {
                el[path[0]] = doc;
            }

            return;
        }

        const futur = el[path[0]];
        path.shift();

        this.nestedCreation(futur, path, doc);
    }

    public replicateFromRemote(key: string) {
        return this.databases[key].replicateFromRemote();
    }

    public sync(key: string, liveAfterSync: boolean = false) {
        return this.databases[key].sync(liveAfterSync);
    }

    private checkAllSync() {
        let sync = true;

        for (const key in this.databases) {
            if (!this.databases[key].synced.value) {
                sync = false;

                break;
            }
        }

        NgxPouchDBEvents.synced.next(sync);
    }

    private checkAllSyncPending() {
        let syncPending = true;

        for (const key in this.databases) {
            if (!this.databases[key].syncPending.value) {
                syncPending = false;

                break;
            }
        }

        NgxPouchDBEvents.syncPending.next(syncPending);
    }

    // User part
    // public login(username: string, password: string) {
    //     const promise = this.databases['main'].remote.logIn(username, password);

    //     promise
    //         .then((session) => {
    //             return this.databases['main'].remote.getUser(session.name);
    //         })
    //         // .then((user) => {
    //         //     // this.setLocalUser(user);
    //         // })
    //     ;

    //     return promise;
    // }
    // public logout() {
    //     return this.databases['main'].remote.logOut()
    //         .then(() => {
    //             for (const key in this.databases) {
    //                 this.databases[key].syncEvent.cancel();
    //             }
    //         })
    //     ;
    // }

    // public getSession() {
    //     return this.databases['main'].remote.getSession()
    //         .then((session) => {
    //             if (session.userCtx.name === null) {
    //                 return null;
    //             }

    //             return this.databases['main'].remote.getUser(session.userCtx.name);
    //         })
    //         .then((user) => {
    //             return this.setLocalUser(user);
    //         })
    //     ;
    // }

    // public getLocalSession() {
    //     return this.databases['main'].local.get('_local/me');
    // }

    // private setLocalUser(remoteUser) {
    //     return this.databases['main'].local.get('_local/me')
    //         .then((localUser) => {
    //             const user = remoteUser;
    //             user._id = localUser._id;
    //             user._rev = localUser._rev;

    //             return this.databases['main'].local.put(user);
    //         }, () => {
    //             const user = remoteUser;
    //             user._id = '_local/me';
    //             user._rev = null;

    //             return this.databases['main'].local.put(user);
    //         })
    //         .then(() => {
    //             return this.databases['main'].local.get('_local/me');
    //         })
    //         .then(localUser => {
    //             return NgxPouchDBService.user = localUser;
    //         })
    //     ;
    // }

    // public putUser(metadata: object) {
    //     return this.databases['main'].remote.putUser(NgxPouchDBService.user.name, {
    //         metadata: metadata
    //     });
    // }
}
