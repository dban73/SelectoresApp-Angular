import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private baseUrl = 'https://restcountries.com/v3.1';

  private _region: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];
  constructor(private http: HttpClient) {}

  get regions(): Region[] {
    return [...this._region];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;
    return this.http.get<Country[]>(url).pipe(
      map((countries) =>
        countries.map((country) => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
    );
  }

  getCountryByAlfaCode(alfaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alfaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url).pipe(
      map((country) => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }

  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);

    const countryRequest: Observable<SmallCountry>[] = [];

    borders.forEach((code) => {
      const request = this.getCountryByAlfaCode(code);
      countryRequest.push(request);
    });

    return combineLatest(countryRequest).pipe(map((countries) => countries));
  }
}
