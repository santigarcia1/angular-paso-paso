import{ Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'cortarCantidadCaracteres'
})

export class CortarCantidadCaracteres implements PipeTransform {
   transform(value: string, numCharactersStart: number, numCharactersEnd: number): string {
       return value.slice(numCharactersStart, numCharactersEnd)
   }
}
