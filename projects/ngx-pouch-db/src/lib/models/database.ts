import { EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';

export class DatabaseSettings {
    public preferLocal = false;
}

export class Database {
    public syncPending: EventEmitter<boolean>;
    public changes: EventEmitter<any>;
    public syncEvent;

    public synced = false;

    public constructor(public local: PouchDB.Database, public remote: PouchDB.Database, public settings?: DatabaseSettings) {
        this.settings = Object.assign(new DatabaseSettings, this.settings);
        this.syncPending = new EventEmitter;
    }

    public get(id: string) {
        return this.selectLocalOrRemote().get(id);
    }

    public put(document: object) {
        return this.selectLocalOrRemote().put(document);
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

        promise
            .on('active', () => {
                this.synced = false;
                this.syncPending.emit(true);
            })
            .on('complete', () => {
                this.synced = true;
                this.syncPending.emit(false);
            })
            .on('error', () => {})
        ;

        return promise;
    }

    public sync(live: boolean = false, secondSync: boolean = false) {
        return this.syncEvent = this.local.sync(this.remote, { live: live, retry: live })
            .on('active', () => {
                if (secondSync) { return; }
                this.synced = false;
                this.syncPending.emit(true);
            })
            .on('change', change => {
                this.synced = true;
                this.syncPending.emit(false);
            })
            .on('error', error => {
                console.error(JSON.stringify(error));
            })
            .on('complete', () => {
                this.synced = true;
                this.syncPending.emit(false);
            })
        ;
    }

    public initChanges() {
        this.changes = new EventEmitter<any>();

        return this.remote.changes({
            since: 'now',
            live: true,
            include_docs: true
        })
            .on('change', changes => {
                this.changes.emit(changes);
            })
        ;
    }

    private selectLocalOrRemote(): PouchDB.Database {
        if (!navigator.onLine || this.synced) {
            return this.local;
        }

        if (!this.settings.preferLocal) {
            return this.remote;
        }

        return this.local;
    }
}
