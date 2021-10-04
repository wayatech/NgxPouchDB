import { BehaviorSubject, Subject } from "rxjs";

export class NgxPouchDBEvents {
    public static syncPending = new BehaviorSubject(false);
    public static synced = new BehaviorSubject(false);
    public static changes = new Subject();
}
