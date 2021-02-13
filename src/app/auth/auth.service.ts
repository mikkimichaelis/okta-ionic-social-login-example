import { Requestor, StorageBackend } from '@openid/appauth';
import { Platform } from '@ionic/angular';
import { Injectable, NgZone } from '@angular/core';
import { IonicAuth, Browser} from 'ionic-appauth';
import { environment } from '../../environments/environment';
import { Plugins, AppUrlOpen } from '@capacitor/core';

const { App } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class AuthService extends IonicAuth {

  constructor(requestor: Requestor,
              storage: StorageBackend,
              browser: Browser,
              private platform: Platform,
              private ngZone: NgZone) {
    super(browser, storage, requestor);

    this.addConfig();
  }

  public async startUpAsync() {
    if (this.platform.is('mobile') && !this.platform.is('mobileweb')) {
      App.addListener('appUrlOpen', (data: AppUrlOpen) => {
        this.ngZone.run(() => {
          this.handleCallback(data.url);
        });
      });
    }

    super.startUpAsync();
  }

  private onDevice(): boolean {
    return this.platform.is('mobile') && !this.platform.is('mobileweb');
  }

  private async addConfig() {
    const config = {
      clientId: '0oa5xkexuo41THfTF5d6',
      issuer: 'https://dev-38660825.okta.com/oauth2/default',
      redirectUri: 'com.okta.dev-38660825:/callback',
      logoutRedirectUri: 'com.okta.dev-38660825:/logout',
      scopes: 'openid profile',
      idp: '0oa5sh3xnOH6srPOi5d6'
    }
    const scopes = config.scopes + (this.onDevice() ? ' offline_access' : '');
    const redirectUri = this.onDevice() ? config.redirectUri : window.location.origin + '/callback';
    const logoutRedirectUri = this.onDevice() ? config.logoutRedirectUri : window.location.origin + '/logout';
    const clientId = config.clientId;
    const issuer = config.issuer;
    const authConfig: any = {
      identity_client: clientId,
      identity_server: issuer,
      redirect_url: redirectUri,
      end_session_redirect_url: logoutRedirectUri,
      scopes,
      usePkce: true,
      auth_extras: {
        idp: config.idp
      }
    };

    this.authConfig = {...authConfig};
  }

  private handleCallback(callbackUrl: string): void {
    if ((callbackUrl).indexOf(this.authConfig.redirect_url) === 0) {
      this.AuthorizationCallBack(callbackUrl).catch((error: string) => {
        console.error(`Authorization callback failed! ${error}`);
      });
    }

    if ((callbackUrl).indexOf(this.authConfig.end_session_redirect_url) === 0) {
      this.EndSessionCallBack().catch((error: string) => {
        console.error(`End session callback failed! ${error}`);
      });
    }
  }
}
