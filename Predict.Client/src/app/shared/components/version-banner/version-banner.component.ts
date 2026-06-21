import { Component, OnInit } from '@angular/core';
import { VersionService } from '../../services/version.service';

@Component({
  selector: 'p-version-banner',
  template: `
    @if (newVersion) {
      <div newVersion class="version-banner">
        <div class="banner-card">
          <div class="banner-header">
            <span class="badge">🆕 New Update</span>
            <button (click)="dismiss()" class="btn-close">✕</button>
          </div>
          <div class="banner-body">
            <p class="version-text">
              Version <strong>{{ newVersion }}</strong> is now available
              <span class="current-version"
                >(Current: v{{ currentVersion }})</span
              >
            </p>
            <button (click)="update()" class="btn-refresh">
              🔄 Update Now
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .version-banner {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        animation: slideIn 0.4s ease-out;
        max-width: 340px;
        width: 100%;
      }

      .banner-card {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        border: 1px solid #e8e8e8;
        overflow: hidden;
      }

      .banner-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .badge {
        color: white;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.3px;
      }

      .btn-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .btn-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .banner-body {
        padding: 16px;
        background: white;
      }

      .version-text {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #333;
      }

      .version-text strong {
        color: #667eea;
        font-weight: 700;
      }

      .current-version {
        display: block;
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }

      .btn-refresh {
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .btn-refresh:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        .version-banner {
          top: 10px;
          right: 10px;
          max-width: calc(100% - 20px);
        }
      }
    `,
  ],
})
export class VersionBannerComponent implements OnInit {
  newVersion: string | null = null;
  currentVersion: string = '';

  constructor(private versionService: VersionService) {}

  ngOnInit() {
    this.currentVersion = this.versionService.getCurrentVersion();
    this.versionService.newVersion$.subscribe((version) => {
      this.newVersion = version;
    });
  }

  update() {
    this.versionService.updateApp();
  }

  dismiss() {
    if (this.newVersion) {
      this.versionService.dismissVersion(this.newVersion);
    }
  }
}
