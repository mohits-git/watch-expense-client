import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
})
export class SumPipe implements PipeTransform {
  transform(value: any[], property: string): number {
    if (value.length == 0) return 0;
    if (typeof value[0] === 'number') {
      return value.reduce((acc, val) => acc + val, 0).toFixed(2);
    }
    if (value[0] === null || value[0] === undefined || typeof value[0] !== 'object' || !Object.hasOwn(value[0], property)) {
      return 0;
    }
    return value.reduce((acc, val) => acc + val[property], 0).toFixed(2);
  }
}
