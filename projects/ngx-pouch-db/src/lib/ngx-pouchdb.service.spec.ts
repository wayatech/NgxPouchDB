import { TestBed } from '@angular/core/testing';
import {  NgxPouchDBService } from './ngx-pouchdb.service';
import { of } from 'rxjs';
import PouchDB from 'pouchdb';
import { NgSwitch } from '@angular/common';



describe('NgxPouchDBService', () => {
    let ngxPouchDbService: NgxPouchDBService;


    beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [NgxPouchDBService]
        });

        ngxPouchDbService = TestBed.get(NgxPouchDBService);
        ngxPouchDbService.init(
            'main',
                ngxPouchDbService.createDatabase('ngxpouchdb', {auto_compaction: true}),
                ngxPouchDbService.createDatabase('http://localhost:5984/ngxpouchdb', {
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
      });

    it('should be created', () => {
        expect(ngxPouchDbService).toBeTruthy();
    });

    it('should create a local database', (done) =>  {
        const expectedResponse: any = {
            adapter: "idb",
            auto_compaction: true,
            db_name: "test",
            doc_count: 0,
            idb_attachment_format: "binary",
            update_seq: 0,
        };
        spyOn(ngxPouchDbService, 'createDatabase').and.callThrough();

        ngxPouchDbService.createDatabase('test', {auto_compaction: true}).info().then((info) => {
            expect(info).toEqual(expectedResponse);
            done();
        })
    });

    it('should get a document', (done) => {
        const expectedResponse: any = {
            age: 26,
            eyeColor: "blue",
            favoriteFruit: "banana",
            name: {
                first: "Bullock",
                last: "Gray"
            },
            _id: "c5bc6467b3ac9d1140547d25f70049f7",
            _rev: "1-38aa3dd4edbceba072612fee80e7b260"
        };
        spyOn(ngxPouchDbService, 'get').and.callThrough();

        ngxPouchDbService.get('main', 'c5bc6467b3ac9d1140547d25f70049f7').subscribe((data) => {
            expect(data).toEqual(expectedResponse);
            done();
        });
    });

    it('should find a document', (done) => {
        spyOn(ngxPouchDbService, 'find').and.callThrough();
        ngxPouchDbService.find('main',
        {
            "selector": {
                "eyeColor": {
                   "$eq": "green"
                }
             }
        }).subscribe((data) => {
            expect(data.docs[0].name.first).toEqual('Olivia');
            expect(data.docs[0].name.last).toEqual('Brown');

            done();
        })
    });

    it('should create a document', (done) => {
        const toPut: Object = {
            age: "18",
            eyeColor: "red",
            name: {
                first: "Edward",
                last: "Cullen"
            },
            favoriteFruit: "Blood"
          };


        spyOn(ngxPouchDbService, 'find').and.callThrough();
        spyOn(ngxPouchDbService, 'create').and.callThrough();

        ngxPouchDbService.find('main',
        {
            "selector": {
                "favoriteFruit": {
                   "$eq": "Blood"
                }
             }
        }).subscribe((data) => {
        if (data.docs.length == 0) {
            console.log(data.docs);
            ngxPouchDbService.create('main', toPut).subscribe(() => {
                ngxPouchDbService.find('main',
                {
                    "selector": {
                        "favoriteFruit": {
                        "$eq": "Blood"
                        }
                    }
                }).subscribe((data) => {
                    expect(data.docs[0].name.first).toEqual('Edward');
                    expect(data.docs[0].name.last).toEqual('Cullen');
                    expect(data.docs[0].age).toEqual('18');
                    done();
                })
            });

        }

        else {
            ngxPouchDbService.find('main',
            {
                "selector": {
                    "favoriteFruit": {
                    "$eq": "Blood"
                    }
                }
            }).subscribe((data) => {
                expect(data.docs[0].name.first).toEqual('Edward');
                expect(data.docs[0].name.last).toEqual('Cullen');
                expect(data.docs[0].age).toEqual('18');
                done();
            })
        }
        })
    });

    it('should update a document in the database', (done) => {

        spyOn(ngxPouchDbService, 'get').and.callThrough();
        spyOn(ngxPouchDbService, 'find').and.callThrough();

        ngxPouchDbService.get('main', 'c5bc6467b3ac9d1140547d25f700ba73').subscribe((datag) => {
             ngxPouchDbService.put('main', datag).subscribe((data) => {
            expect(data._rev).not.toEqual(datag._rev);
            done();
            })

        })

    });

    it('should update a document in the database', (done) => {

        spyOn(ngxPouchDbService, 'get').and.callThrough();
        spyOn(ngxPouchDbService, 'find').and.callThrough();

        ngxPouchDbService.get('main', 'c5bc6467b3ac9d1140547d25f700ba73').subscribe((datag) => {
             ngxPouchDbService.put('main', datag).subscribe((data) => {
            expect(data._rev).not.toEqual(datag._rev);
            done();
            })

        })

    });

    it('should be logged', (done) => {
        spyOn(ngxPouchDbService, 'login').and.callThrough();
        ngxPouchDbService.login('Alban', 'wayapass').then((data)=> {
            expect(data.ok).toEqual(true);
            done();
        })
    });

    it('replicate from the remote database', (done) => {
        spyOn(ngxPouchDbService, 'replicateFromRemote').and.callThrough();
        ngxPouchDbService.replicateFromRemote('main').then((data)=> {
            expect(data.ok).toEqual(true);
            done();

        })
    });


    it('should be synced', (done) => {
        spyOn(ngxPouchDbService, 'sync').and.callThrough();
        ngxPouchDbService.sync('main').then( (data) => {
            expect(data.pull.ok).toEqual(true);
            expect(data.push.ok).toEqual(true);
            done();
        })
    });

    it('should be true if logged', () => {
        expect(NgxPouchDBService.isLogged()).toEqual(true);
    });


    it('should get the session' , () => {
        ngxPouchDbService.getSession().then( (data) => {
            console.log('session data',data);
        })
    })

    it('should get the local session' , () => {
        ngxPouchDbService.getLocalSession().then( (data) => {
            console.log('local session data', data);
        })
    })

    it('should put a user' , () => {
        ngxPouchDbService.getLocalSession().then( (data) => {
            console.log('local session data', data);
        })
    })



});

