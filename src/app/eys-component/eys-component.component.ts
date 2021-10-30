import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  EyesCoordinates,
  IncomingDataService,
} from '../shared/services/incoming-data.service';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-eyes-component',
  templateUrl: './eyes-component.component.html',
  styleUrls: ['./eyes-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EysComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pagination') public pagination: ElementRef;
  @ViewChild('svg') private svgEl: ElementRef;

  public coordinates: EyesCoordinates;
  public imageNum: number;
  public imagePath$ = this.incomingData.imagePath$;

  public leftCenterArrow: string;
  public leftTopArrow: string;
  public leftBottomArrow: string;

  public rightCenterArrow: string;
  public rightTopArrow: string;
  public rightBottomArrow: string;

  private incomingDataSubscription: Subscription;

  private mouseMove$: Observable<MouseEvent>;
  private mouseEventSubscription: Subscription;

  constructor(
    private incomingData: IncomingDataService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const storageImageNum = localStorage.getItem('imageNum');

    if (storageImageNum !== null) {
      this.imageNum = +storageImageNum;
    } else {
      this.imageNum = 1;
    }

    this.incomingData.getData(this.imageNum);

    this.incomingData.coordinates$.subscribe((coordinates) => {
      this.coordinates = coordinates;

      // arrows

      this.drawAllArrows();
    });
  }

  ngAfterViewInit(): void {
    this.mouseMove$ = fromEvent(this.svgEl.nativeElement, 'mousemove');

    // pagination view

    this.paginationView();
  }

  mouseEnter(): void {}

  moveVertexPoint(vertex: string): void {
    this.mouseEventSubscription = this.mouseMove$.subscribe((event) => {
      this.coordinates[vertex] = event.offsetY;

      this.drawAllArrows();
    });
  }

  moveCenterPoint(
    vertexTopX: string,
    vertexBottomX: string,
    centerX: string,
    centerY: string
  ): void {
    this.mouseEventSubscription = this.mouseMove$.subscribe((event) => {
      this.coordinates[centerX] = event.offsetX;
      this.coordinates[vertexTopX] = event.offsetX;
      this.coordinates[vertexBottomX] = event.offsetX;

      this.coordinates[centerY] = event.offsetY;

      this.drawAllArrows();
    });
  }

  resizeCircle(size: string, center: string): void {
    this.mouseEventSubscription = this.mouseMove$.subscribe((event) => {
      this.coordinates[size] =
        (Math.abs(+this.coordinates[center] - event.offsetX) / 14) * 2;

      this.drawAllArrows();
    });
  }

  mouseUp(): void {
    this.mouseEventSubscription.unsubscribe();
  }

  paginationView(): void {
    const storageImageNum = localStorage.getItem('imageNum');
    const elementsList = this.pagination.nativeElement.children;

    if (storageImageNum !== null) {
      for (const item of elementsList) {
        if (+item.innerText === +storageImageNum) {
          item.classList.add('eyes__page--active');
        } else {
          item.classList.remove('eyes__page--active');
        }
      }
    } else {
      elementsList[0].classList.add('eyes__page--active');
    }
  }

  drawAllArrows(): void {
    this.leftCenterArrow = this.drawCenterArrow(
      this.coordinates.OSCenterX,
      this.coordinates.OSCenterY,
      this.coordinates.OSSize
    );

    this.leftTopArrow = this.drawDistanceArrow(
      this.coordinates.OSTopX,
      this.coordinates.OSTopY,
      this.coordinates.OSCenterX,
      this.coordinates.OSCenterY,
      this.coordinates.OSSize
    );

    this.leftBottomArrow = this.drawDistanceArrow(
      this.coordinates.OSCenterX,
      this.coordinates.OSCenterY,
      this.coordinates.OSBottomX,
      this.coordinates.OSBottomY,
      this.coordinates.OSSize
    );

    this.rightCenterArrow = this.drawCenterArrow(
      this.coordinates.ODCenterX,
      this.coordinates.ODCenterY,
      this.coordinates.ODSize
    );

    this.rightTopArrow = this.drawDistanceArrow(
      this.coordinates.ODTopX,
      this.coordinates.ODTopY,
      this.coordinates.ODCenterX,
      this.coordinates.ODCenterY,
      this.coordinates.ODSize
    );

    this.rightBottomArrow = this.drawDistanceArrow(
      this.coordinates.ODCenterX,
      this.coordinates.ODCenterY,
      this.coordinates.ODBottomX,
      this.coordinates.ODBottomY,
      this.coordinates.ODSize
    );
  }

  drawCenterArrow(x: number, y: number, diameter: number): string {
    return `
    M${x - (diameter * 14) / 2},${y}
    L${x + (diameter * 14) / 2},${y}
    L${x + (diameter * 14) / 2 - 5},${y - 2}
    L${x + (diameter * 14) / 2 - 5},${y + 2}
    L${x + (diameter * 14) / 2},${y}
    L${x - (diameter * 14) / 2},${y}
    L${x - (diameter * 14) / 2 + 5},${y - 2}
    L${x - (diameter * 14) / 2 + 5},${y + 2}
    `;
  }

  drawDistanceArrow(
    topX: number,
    topY: number,
    centerX: number,
    centerY: number,
    diameter: number
  ): string {
    return `
    M${topX + (diameter * 14) / 2},${topY}
    L${centerX + (diameter * 14) / 2},${centerY}
    L${centerX + (diameter * 14) / 2 + 2},${centerY - 5}
    L${centerX + (diameter * 14) / 2 - 2},${centerY - 5}
    L${centerX + (diameter * 14) / 2},${centerY}
    L${topX + (diameter * 14) / 2},${topY}
    L${topX + (diameter * 14) / 2 + 2},${topY + 5}
    L${topX + (diameter * 14) / 2 - 2},${topY + 5}
    `;
  }

  changePage(event: Event): void {
    const element = event.target as HTMLSpanElement;

    const childrenList = this.pagination.nativeElement.children;

    for (const item of childrenList) {
      if (element.classList.contains('eyes__page')) {
        item.classList.remove('eyes__page--active');
      }
    }

    if (element.classList.contains('eyes__page')) {
      element.classList.add('eyes__page--active');
      localStorage.setItem('imageNum', JSON.stringify(+element.innerText));
      this.imageNum = +element.innerText;
      this.incomingData.getData(+element.innerText);
    }
  }

  dispatchData(): void {
    this.incomingData.dispatchData(this.coordinates, this.imageNum);
    this.snackBar.open('Saved', '', { duration: 500 });
  }

  ngOnDestroy(): void {
    this.incomingDataSubscription.unsubscribe();
  }
}
