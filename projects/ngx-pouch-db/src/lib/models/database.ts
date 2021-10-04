import PouchDB from 'pouchdb';
import { BehaviorSubject, Subject } from 'rxjs';

import { NgxPouchDBEvents } from '../ngx-pouchdb.events';

export class DatabaseSettings {
    public preferLocal? = false;
    public syncAtStart? = false;
    public liveSync? = false;
}

export class Database {
    public changes: Subject<any>;
    public syncEvent;

    public synced = new BehaviorSubject(false);
    public syncPending = new BehaviorSubject(false);

    public constructor(public local: PouchDB.Database, public remote: PouchDB.Database, public settings?: DatabaseSettings) {
        this.settings = Object.assign(new DatabaseSettings, this.settings);

        if (this.settings.syncAtStart) {
            this.sync(settings.liveSync);
        }
    }

    public get(id: string, queryParams = {}) {
        return this.selectLocalOrRemote().get(id, queryParams);
    }

    public put(document: object, queryParams = {}) {
        return this.selectLocalOrRemote().put(document, queryParams);
    }

    public find(filter: PouchDB.Find.FindRequest<{}>) {
        return this.selectLocalOrRemote().find(filter);
    }

    public query(view: string, queryParams = {}) {
        const paramDefault = { include_docs: true, attachments: true };

        return this.selectLocalOrRemote().query(view, {...paramDefault, ...queryParams});
    }

    public createIndex(object) {
        return this.selectLocalOrRemote().createIndex(object);
    }

    public remove(document: any) {
        // let doc;
        // Object.assign(doc, document);

        return this.selectLocalOrRemote().remove(document);
    }

    public replicateFromRemote() {
        const promise = this.local.replicate.from(this.remote);

        // promise
        //     .on('active', () => {
        //         console.log('active');
        //         this.synced.next(false);
        //         this.syncPending.next(true);
        //     })
        //     .on('complete', () => {
        //         console.log('complete');
        //         this.synced.next(true);
        //         this.syncPending.next(false);
        //     })
        //     .on('error', () => {})
        // ;

        return promise;
    }

    public liveSync() {
        if (!navigator.onLine) {
            console.error('You are offline');
            return;
        }

        return this.syncEvent = this.local.sync(this.remote, { live: true, retry: true })
            .on('change', data => {
                NgxPouchDBEvents.changes.next(data);
            })
            .on('error', error => {
                console.error(JSON.stringify(error));
            })
        ;
    }

    public sync(runLiveSyncAfterComplete: boolean = false) {
        if (!navigator.onLine) {
            console.error('You are offline');
            return;
        }

        this.syncPending.next(true);

        return this.syncEvent = this.local.sync(this.remote, { live: false, retry: true })
            .on('error', error => {
                console.error("error", JSON.stringify(error));
            })
            .on('complete', () => {
                this.synced.next(true);
                this.syncPending.next(false);

                if (runLiveSyncAfterComplete) {
                    this.liveSync();
                }
            })
        ;
    }

    private selectLocalOrRemote(): PouchDB.Database {
        if (!navigator.onLine) {
            return this.local;
        }

        if (!this.settings.preferLocal) {
            return this.remote;
        }

        return this.local;
    }
}
