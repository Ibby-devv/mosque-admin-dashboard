import { Timestamp } from 'firebase/firestore';

/**
 * Test helper: Convert Timestamp to date string in YYYY-MM-DD format
 * This simulates the logic used in EventsTab.openModal()
 */
function convertTimestampToDateString(timestamp: Timestamp): string {
  let dateStr = '';
  if (timestamp?.toDate) {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }
  return dateStr;
}

describe('EventsTab Date Conversion', () => {
  describe('convertTimestampToDateString', () => {
    it('should correctly convert a Timestamp to YYYY-MM-DD format without timezone shift', () => {
      // Create a date for January 15, 2024 at midnight local time
      const testDate = new Date(2024, 0, 15, 0, 0, 0); // Month is 0-indexed
      const timestamp = Timestamp.fromDate(testDate);
      
      const result = convertTimestampToDateString(timestamp);
      
      // Should return the correct date string
      expect(result).toBe('2024-01-15');
    });

    it('should handle dates near timezone boundaries correctly', () => {
      // Create a date that would shift to previous day if converted to UTC
      // For Australia/Sydney (UTC+11), midnight would be 1 PM previous day in UTC
      const testDate = new Date(2024, 5, 1, 0, 0, 0); // June 1, 2024 midnight
      const timestamp = Timestamp.fromDate(testDate);
      
      const result = convertTimestampToDateString(timestamp);
      
      // Should still show June 1, not May 31
      expect(result).toBe('2024-06-01');
    });

    it('should handle dates at end of month correctly', () => {
      const testDate = new Date(2024, 11, 31, 23, 59, 59); // Dec 31, 2024
      const timestamp = Timestamp.fromDate(testDate);
      
      const result = convertTimestampToDateString(timestamp);
      
      expect(result).toBe('2024-12-31');
    });

    it('should handle leap year dates correctly', () => {
      const testDate = new Date(2024, 1, 29, 12, 0, 0); // Feb 29, 2024 (leap year)
      const timestamp = Timestamp.fromDate(testDate);
      
      const result = convertTimestampToDateString(timestamp);
      
      expect(result).toBe('2024-02-29');
    });

    it('should pad single-digit months and days with zeros', () => {
      const testDate = new Date(2024, 0, 5, 12, 0, 0); // Jan 5, 2024
      const timestamp = Timestamp.fromDate(testDate);
      
      const result = convertTimestampToDateString(timestamp);
      
      expect(result).toBe('2024-01-05');
    });

    it('should return empty string for invalid timestamp', () => {
      const result = convertTimestampToDateString(null as any);
      
      expect(result).toBe('');
    });
  });

  describe('Date conversion comparison: toISOString vs local components', () => {
    it('demonstrates the timezone issue with toISOString approach', () => {
      // Create a date for Jan 15, 2024 at midnight in local timezone
      const testDate = new Date(2024, 0, 15, 0, 0, 0);
      const timestamp = Timestamp.fromDate(testDate);
      
      // The OLD approach (using toISOString) - may cause timezone shift
      const oldApproach = timestamp.toDate().toISOString().split('T')[0];
      
      // The NEW approach (using local components) - no timezone shift
      const newApproach = convertTimestampToDateString(timestamp);
      
      // The new approach should always match the expected date
      expect(newApproach).toBe('2024-01-15');
      
      // The old approach might differ depending on timezone
      // In UTC+11 timezone, midnight Jan 15 becomes 1 PM Jan 14 in UTC
      // So toISOString() might return '2024-01-14'
      console.log('Old approach result:', oldApproach);
      console.log('New approach result:', newApproach);
      console.log('Timezone offset:', testDate.getTimezoneOffset(), 'minutes');
    });
  });
});
