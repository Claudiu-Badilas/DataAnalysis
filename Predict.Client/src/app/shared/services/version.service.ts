import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VersionService {
  private currentVersion = localStorage.getItem('appVersion') || '1.0.0';
  private newVersionSubject = new BehaviorSubject<string | null>(null);
  newVersion$ = this.newVersionSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startVersionCheck();
  }

  private startVersionCheck() {
    // Check immediately and then every 60 seconds
    this.checkVersion();
    interval(60000).subscribe(() => this.checkVersion());
  }

  private checkVersion() {
    this.http
      .get<{ version: string }>('/predict/assets/version.json')
      .subscribe({
        next: (data) => {
          if (data.version !== this.currentVersion) {
            // Check if this version was already dismissed
            const dismissed =
              localStorage.getItem(`dismissed_${data.version}`) === 'true';
            if (!dismissed) {
              this.newVersionSubject.next(data.version);
            }
          }
        },
        error: () => console.log('Version check failed'),
      });
  }

  updateApp() {
    localStorage.setItem(
      'appVersion',
      this.newVersionSubject.value || this.currentVersion,
    );
    window.location.reload();
  }

  dismissVersion(version: string) {
    localStorage.setItem(`dismissed_${version}`, 'true');
    this.newVersionSubject.next(null);
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }
}
