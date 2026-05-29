import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule],
  template: `<header class="topbar">
    <div class="topbar__inner">
      <div class="brand">
        <div class="brand__logo">
          <!-- sparkles -->
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"
            />
            <path
              d="M19 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9z"
            />
          </svg>
        </div>
        <span class="brand__name">Predict</span>
      </div>

      <div class="module-nav">
        <ng-content select="[module-navigation]"></ng-content>
      </div>

      <div class="actions">
        <button *ngFor="let n of nav" type="button" class="actions__link">
          <ng-container [ngSwitch]="n.icon">
            <!-- wallet -->
            <svg
              *ngSwitchCase="'wallet'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"
              />
              <path d="M16 12h5v4h-5a2 2 0 1 1 0-4z" />
            </svg>
            <!-- trending down -->
            <svg
              *ngSwitchCase="'trending'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
              <polyline points="16 17 22 17 22 11" />
            </svg>
            <!-- file -->
            <svg
              *ngSwitchCase="'file'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <!-- receipt -->
            <svg
              *ngSwitchCase="'receipt'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2z" />
              <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
            <!-- settings -->
            <svg
              *ngSwitchCase="'settings'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
              />
            </svg>
          </ng-container>
          <span class="action-label">{{ n.label }}</span>
        </button>
      </div>
    </div>
  </header> `,
  styles: `
    :host {
      display: block;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .topbar {
      position: relative;
      backdrop-filter: blur(14px);
      background: color-mix(in oklab, white 95%, transparent);
      border-bottom: 1px solid #e5e7eb;
      width: 100%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .topbar__inner {
      width: 100%;
      height: 50px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .brand__logo {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: oklch(0.55 0.15 195);
      color: white;
      display: grid;
      place-items: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }

    .brand__name {
      font-weight: 700;
      font-size: 1.125rem;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .module-nav {
      flex: 1;
      display: flex;
      justify-content: center;
      min-width: 0;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .actions__link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 0;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #64748b;
      white-space: nowrap;
    }

    .actions__link:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .actions__link:active {
      transform: scale(0.98);
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .topbar__inner {
        padding: 0 16px;
        gap: 12px;
      }

      .brand__name {
        display: none;
      }

      .brand__logo {
        width: 40px;
        height: 40px;
      }

      .actions {
        gap: 2px;
      }

      .actions__link {
        padding: 8px;
        gap: 0;
      }

      .action-label {
        display: none;
      }
    }

    /* Tablet Responsive Styles */
    @media (min-width: 769px) and (max-width: 1024px) {
      .topbar__inner {
        padding: 0 20px;
      }

      .actions__link {
        padding: 8px 10px;
      }

      .action-label {
        display: inline-block;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .topbar__inner {
        height: 56px;
        padding: 0 12px;
        gap: 8px;
      }

      .brand__logo {
        width: 32px;
        height: 32px;
      }

      .brand__logo svg {
        width: 16px;
        height: 16px;
      }

      .actions__link svg {
        width: 16px;
        height: 16px;
      }

      .actions__link {
        padding: 6px;
      }
    }
  `,
})
export class TopBar2Component {
  nav: {
    label: string;
    icon: 'wallet' | 'trending' | 'file' | 'receipt' | 'settings';
  }[] = [
    { label: 'Mortgage', icon: 'wallet' },
    { label: 'Transactions', icon: 'trending' },
    { label: 'Invoices', icon: 'file' },
    { label: 'Receipts', icon: 'receipt' },
    { label: 'Settings', icon: 'settings' },
  ];
}
