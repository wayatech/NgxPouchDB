import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPouchdbModule } from 'projects/ngx-pouch-db/src/lib/ngx-pouchdb.module';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgxPouchdbModule.forRoot({
            databases: [
                { key: 'main', localDB: 'ngxpouchdb', remoteDB: 'http://localhost:5984/ngxpouchdb' }
            ]
        }),
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
