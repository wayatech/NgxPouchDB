import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPouchdbModule } from 'projects/ngx-pouch-db/src/lib/ngx-pouchdb.module';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgxPouchdbModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
