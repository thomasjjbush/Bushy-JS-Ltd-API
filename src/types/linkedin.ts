export enum LinkedinEndpoints {
  ACCESS_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken',
  CODE = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={clientId}&redirect_uri={redirectUrl}&scope=email,openid,profile',
  CONTACT_INFO = 'https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))',
  ME = 'https://api.linkedin.com/v2/userinfo',
}

// 1ring2ruleThemAll_#

export interface LinkedinUser {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: { country: string; language: string };
  name: string;
  picture: string;
  sub: string;
}
