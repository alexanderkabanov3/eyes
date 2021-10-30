import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Subject } from 'rxjs';

interface ImageResponse {
  fileName: string;
  ptosisImages: Array<string>;
  scope: string;
}

export interface EyesCoordinates {
  [key: string]: number | string;
  ODBottomX: number;
  ODBottomY: number;
  ODCenterX: number;
  ODCenterY: number;
  ODSize: number;
  ODTopX: number;
  ODTopY: number;
  OSBottomX: number;
  OSBottomY: number;
  OSCenterX: number;
  OSCenterY: number;
  OSSize: number;
  OSTopX: number;
  OSTopY: number;
  chartTypeString: string;
  message_type: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class IncomingDataService {
  public imagePath$ = new Subject<string>();
  public coordinates$ = new Subject<EyesCoordinates>();

  constructor(
    private eyesPictureHttp: HttpClient,
    private eyesCoordinatesHttp: HttpClient
  ) {}

  getData(imageNum: number): void {
    forkJoin([
      this.eyesPictureHttp.get<ImageResponse>(
        'https://alexanderkabanov3.github.io/eyes/assets/data/input.json'
      ),
      this.eyesCoordinatesHttp.get<EyesCoordinates>(
        `https://alexanderkabanov3.github.io/eyes/assets/data/coordinates${imageNum}.json`
      ),
    ]).subscribe((results: [ImageResponse, EyesCoordinates]) => {
      this.imagePath$.next(
        `https://alexanderkabanov3.github.io/eyes/assets/data/ptosis-${imageNum}.jpg`
      );
      this.coordinates$.next(results[1]);
    });
  }

  dispatchData(coordinates: EyesCoordinates, imageNum: number): void {
    // post new coordinates to back
    // this.eyesCoordinatesHttp.post(`https://alexanderkabanov3.github.io/eyes/assets/data/ptosis-${imageNum}.jpg`, {
    //   Headers,
    // });
  }
}
