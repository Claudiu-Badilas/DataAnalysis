// new-version-banner.component.ts
import { Component, OnInit } from '@angular/core';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'app-new-version-banner',
  template: `
    <div *ngIf="showBanner" class="version-banner">
      <div class="banner-content">
        <span class="banner-icon">🔄</span>
        <span class="banner-text">
          A new version ({{ latestVersion }}) is available!
        </span>
        <button (click)="updateApp()" class="update-btn">Update Now</button>
        <button (click)="dismissBanner()" class="dismiss-btn">✕</button>
      </div>
    </div>
  `,
  styles: [
    `
      .version-banner {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2c3e50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        max-width: 90%;
        animation: slideUp 0.5s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      .banner-content {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .banner-icon {
        font-size: 20px;
      }

      .banner-text {
        font-size: 14px;
        font-weight: 500;
      }

      .update-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s;
      }

      .update-btn:hover {
        background: #2980b9;
      }

      .dismiss-btn {
        background: transparent;
        color: white;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0 5px;
        opacity: 0.7;
        transition: opacity 0.3s;
      }

      .dismiss-btn:hover {
        opacity: 1;
      }

      @media (max-width: 600px) {
        .version-banner {
          bottom: 10px;
          padding: 12px 15px;
          width: 95%;
        }

        .banner-content {
          gap: 10px;
        }

        .banner-text {
          font-size: 12px;
          width: 100%;
          text-align: center;
        }
      }
    `,
  ],
})
export class NewVersionBannerComponent implements OnInit {
  showBanner = false;
  latestVersion = '';

  constructor(private versionService: VersionService) {}

  ngOnInit() {
    this.versionService.newVersionAvailable.subscribe((available) => {
      if (available) {
        this.latestVersion =
          this.versionService['latestVersion'] || 'new version';
        this.showBanner = true;
      }
    });
  }

  updateApp() {
    this.versionService.refreshApp();
  }

  dismissBanner() {
    this.showBanner = false;
    // Store in localStorage to remember dismissal
    localStorage.setItem('versionDismissed', this.latestVersion);
  }
}
