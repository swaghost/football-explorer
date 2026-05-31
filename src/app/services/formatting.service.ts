import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormattingService {
  constructor() {}

  /**
   * Format a date as relative time text with human-friendly output
   * @param date The date to format (or null)
   * @returns Formatted string like "Today, 5 minutes ago", "Yesterday, 3:45 PM", or "10/28/2025, 2:30 PM"
   */
  formatRelativeTime(date: Date | null): string {
    if (!date) return '';

    const now = new Date();
    const visitDate = date;
    const diffMs = now.getTime() - visitDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    // Get start of today and yesterday for comparison
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Check if visit was today
    if (visitDate >= todayStart) {
      if (diffSeconds < 60) {
        return `Today, ${diffSeconds} second${
          diffSeconds !== 1 ? 's' : ''
        } ago`;
      } else if (diffMinutes < 60) {
        return `Today, ${diffMinutes} minute${
          diffMinutes !== 1 ? 's' : ''
        } ago`;
      } else {
        return `Today, ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
    }

    // Check if visit was yesterday
    if (visitDate >= yesterdayStart && visitDate < todayStart) {
      return `Yesterday, ${this.formatTime(visitDate)}`;
    }

    // For dates before yesterday, show full date and time
    const dateStr = visitDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
    return `${dateStr}, ${this.formatTime(visitDate)}`;
  }

  /**
   * Format time as HH:MM AM/PM
   * @param date The date to extract time from
   * @returns Formatted time string like "3:45 PM"
   */
  private formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    return `${hours}:${minutesStr} ${ampm}`;
  }
}
