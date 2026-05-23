/**
 * Date utility functions
 */

export const dateUtils = {
  /**
   * Format date to YYYY-MM-DD
   */
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Format date to readable string
   */
  formatDateReadable: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Check if date has passed
   */
  isDatePassed: (date) => {
    return new Date(date) < new Date();
  },

  /**
   * Check if date is today
   */
  isToday: (date) => {
    const today = new Date();
    const d = new Date(date);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  },

  /**
   * Get days until date
   */
  getDaysUntil: (date) => {
    const now = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * Format time to HH:MM
   */
  formatTime: (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  },

  /**
   * Get current timestamp
   */
  getCurrentTimestamp: () => {
    return new Date().toISOString();
  },
};

export default dateUtils;
