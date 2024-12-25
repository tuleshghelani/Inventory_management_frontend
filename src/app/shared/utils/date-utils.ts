import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtils {
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Create a date object from the UTC string
      const date = new Date(dateString);
      
      // Format the date according to local timezone
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }
} 