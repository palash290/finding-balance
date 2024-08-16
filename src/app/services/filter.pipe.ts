import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any[], searchTerm: string): any[] {
    if (!value || !searchTerm) {
      return value;
    }

    return value.filter(item => {
      return item.name && item.name.toLowerCase().includes(searchTerm) || item.full_name && item.full_name.toLowerCase().includes(searchTerm) ||
      item.participants[0]?.Coach?.full_name && item.participants[0]?.Coach?.full_name.toLowerCase().includes(searchTerm) || 
      item.participants[0]?.User?.full_name && item.participants[0]?.User?.full_name.toLowerCase().includes(searchTerm)
    });
  }
  //date_raised
}//item.participant?.Coach?.full_name