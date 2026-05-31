import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { INation } from './../../../interfaces/maps/INation.interface';
import * as d3 from 'd3';
import { INationGeography } from './../../../interfaces/maps/INationGeography.interface';
import { ICity } from './../../../interfaces/maps/ICity.interface';

@Component({
  selector: 'app-d3-example-nation-mapper',
  templateUrl: './d3-example-map-nations.component.html',
  styleUrl: './d3-example-map-nations.component.scss',
  standalone: false,
})
export class D3ExampleMapNationsComponent implements OnInit {
  outlineColor: string = '#0000ff'; // Default outline color (blue)
  fillMap: boolean = false; // Add this property
  fillColor: string = '#1976d2'; // Default blue
  nations: INation[] = [];
  nationCodes: string[] = [];
  selectedCode: string = '';
  selectedFeature: any = null;
  geoJsonData: INationGeography | null = null;
  svgPath: string = '';
  cities: ICity[] = [];
  // SVG dimensions
  readonly svgWidth = 1024;
  readonly svgHeight = 768;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<INation[]>('assets/map-files/NATION-CODES.ISO-3166-SL-CURATED.json')
      .subscribe((nations) => {
        this.nations = nations;
        this.nationCodes = nations.map((n) => n.alpha3);
      });

    this.http
      .get<INationGeography>('assets/map-files/NATIONS.geojson')
      .subscribe((geojson) => {
        this.geoJsonData = geojson;
      });

    this.http
      .get<ICity[]>('assets/map-files/CITIES.json')
      .subscribe((cities) => {
        this.cities = cities;
      });
  }
  onSelectClub(clubId) {}
  onSelect(code: string) {
    this.selectedCode = code;
    if (this.geoJsonData && this.geoJsonData.features) {
      this.selectedFeature = this.geoJsonData.features.find(
        (f: any) => f.properties['ISO3166-1-Alpha-3'] === code,
      );
      if (this.selectedFeature) {
        const projection = d3
          .geoMercator()
          .fitSize(
            [this.svgWidth, this.svgHeight],
            this.selectedFeature as any,
          );
        const pathGenerator = d3.geoPath().projection(projection);
        this.svgPath = pathGenerator(this.selectedFeature as any) || '';
      } else {
        this.svgPath = '';
      }
    } else {
      this.selectedFeature = null;
      this.svgPath = '';
    }
  }

  projectedCities(): { cx: number; cy: number; r: number; name: string }[] {
    if (!this.cities || !this.selectedFeature) return [];
    // Use the same projection as the map
    const projection = d3
      .geoMercator()
      .fitSize([this.svgWidth, this.svgHeight], this.selectedFeature as any);
    // Find max population for scaling
    const maxPop = Math.max(...this.cities.map((c) => c.population));
    return this.cities.map((city) => {
      const [cx, cy] = projection([city.longitude, city.latitude]);
      // Scale radius (adjust multiplier as needed)
      const r = 5 + 20 * (city.population / maxPop);
      return { cx, cy, r, name: city.name };
    });
  }
}
