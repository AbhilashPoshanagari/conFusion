import { Injectable } from '@angular/core';
import { Dish } from '../shared/dish';
import { Observable,of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
/* import { HttpModule } from '@angular/http'; */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

const httpOptions = {
headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class DishService {

  constructor(private http: HttpClient,
  private processHTTPMsgService: ProcessHTTPMsgService) { }

  getDishes(): Observable<Dish[]> {
  return this.http.get<Dish[]>(baseURL + 'dishes').pipe(catchError(this.processHTTPMsgService.handleError));
}

getDish(id: string): Observable<Dish> {
  return this.http.get<Dish>(baseURL + 'dishes/' + id).pipe(catchError(this.processHTTPMsgService.handleError));
}

getFeaturedDish(): Observable<Dish> {
  return this.http.get<Dish[]>(baseURL + 'dishes?featured=true').pipe(map(dishes => dishes[0])).pipe(catchError(this.processHTTPMsgService.handleError));
}

getDishIds(): Observable<string[] | any> {
  return this.getDishes().pipe(map(dishes => dishes.map(dish => dish.id))).pipe(catchError(this.processHTTPMsgService.handleError));
}
putDish(dish: Dish): Observable<Dish> {
    return this.http.put<Dish>(baseURL + 'dishes/' + dish.id, dish, httpOptions)
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

}
