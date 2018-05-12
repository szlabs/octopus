import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PubSubService {
    private subjects: Subject<any>[] = [];

    publish(eventName: string, message: any) {
        // ensure a subject for the event name exists
        this.subjects[eventName] = this.subjects[eventName] || new Subject<any>();

        // publish event
        this.subjects[eventName].next(message);
    }

    on(eventName: string): Observable<any> {
        // ensure a subject for the event name exists
        this.subjects[eventName] = this.subjects[eventName] || new Subject<any>();

        // return observable 
        return this.subjects[eventName].asObservable();
    }
}