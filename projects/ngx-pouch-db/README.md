# NgxPouchDB

## Installation

### NPM

```
npm install --save ngx-pouchdb pouchdb pouchdb-authentication pouchdb-find uuid
npm install --save-dev @types/pouchdb
```

### Angular

```ts
...
import { NgxPouchdbModule } from 'ngx-pouchdb';
...

@NgModule({
    declarations: [
        ...
    ],
    imports: [
        NgxPouchdbModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

Add in polyfills.ts
`(window as any).global = window;`

Add in tsconfig.json
```json
"compilerOptions": {
    //...
    "allowSyntheticDefaultImports": true
}
```

## Usage

You can define several couple of PouchDB databases (local / remote). The first must be named **main**.

```ts
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { NgxPouchDBService } from 'ngx-pouchdb';
...

...
public constructor(private ngxPouchDBService: NgxPouchDBService) {}
...

// First
this.ngxPouchDBService.init(
    'main',
    this.ngxPouchDBService.createDatabase(localName, {auto_compaction: true}),
    this.ngxPouchDBService.createDatabase(remoteUrl + '/' + localName, {
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
```