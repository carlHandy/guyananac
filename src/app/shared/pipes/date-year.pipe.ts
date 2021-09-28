import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateYear',
})
export class DateYearPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
      return '';
    }
    const res = new Date(value * 1000);

    return res.getFullYear().toString();
  }
}
