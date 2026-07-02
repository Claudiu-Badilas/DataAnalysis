// version.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private currentVersion = '';
  private latestVersion = '';
  private isNewVersionAvailable = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Initial check
    this.checkForUpdates();

    // Check for updates every 5 minutes
    interval(3 * 1000).subscribe(() => {
      this.checkForUpdates();
    });

    // Also check when user becomes active again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  get newVersionAvailable() {
    return this.isNewVersionAvailable.asObservable();
  }

  checkForUpdates() {
    // Add cache-busting parameter
    const url = `/predict/version.json?t=${new Date().getTime()}`;

    this.http.get<{ version: string; timestamp: string }>(url).subscribe({
      next: (data) => {
        this.latestVersion = data.version;
        console.log('Current version check:', {
          current: this.currentVersion,
          latest: this.latestVersion,
        });

        if (this.currentVersion && this.currentVersion !== this.latestVersion) {
          this.isNewVersionAvailable.next(true);
        } else if (!this.currentVersion) {
          this.currentVersion = this.latestVersion;
        }
      },
      error: (error) => {
        console.warn('Version check failed:', error);
      },
    });
  }

  refreshApp() {
    this.isNewVersionAvailable.next(false);
    window.location.reload();
  }
}
