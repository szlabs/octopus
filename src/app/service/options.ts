import { RequestOptions, Headers } from '@angular/http';

export const HTTP_JSON_OPTIONS: RequestOptions = new RequestOptions({
    headers: new Headers({
        "Content-Type": 'application/json',
        "Accept": 'application/json'
    })
})