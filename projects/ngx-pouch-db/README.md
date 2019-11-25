# NgxPouchDB

## Installation

### NPM

```
npm install --save ngx-pouchdb pouchdb pouchdb-authentication pouchdb-find uuid
npm install --save-dev @types/pouchdb
```

### Yarn

```
yarn add ngx-pouchdb pouchdb pouchdb-authentication pouchdb-find uuid
yarn add -D @types/pouchdb
```

### Angular

Add in app.module.ts
```ts
...
import { NgxPouchdbModule } from 'ngx-pouchdb';
...

@NgModule({
    declarations: [
        ...
    ],
    imports: [
        NgxPouchdbModule.forRoot({
            databases: [
                { key: 'main', localDB: 'shakit', remoteDB: 'http://localhost:5984/shakit' }
            ]
        })
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
import { NgxPouchDBService } from 'ngx-pouchdb';
...

...
public constructor(private ngxPouchDBService: NgxPouchDBService) {}
...

// First
this.ngxPouchDBService.get('uuid');
```