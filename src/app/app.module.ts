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
        NgxPouchdbModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
