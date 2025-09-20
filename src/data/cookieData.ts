export interface CookieCategory {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export const cookieCategories: CookieCategory[] = [
  {
    id: 'necessary',
    title: 'Necessary cookie files',
    description: 'The purpose of these cookies is to deliver the requested service, application, or resource. Any of your requests cannot be done properly without these cookies. In general, their purpose is to manage the actions you perform on our website, e.g., they help you get visual elements, use page resources, sign in to your account. In addition to setting up essential functions, with these cookies, we can ensure the security and efficiency of our website.'
  },
  {
    id: 'analytical',
    title: 'Analytical cookie files',
    description: 'The purpose of these cookies is to provide quantitative data on user interactions with our website. Also, these cookie files collect information that is used to track website performance. Usually, they do not collect sensitive information and provide us only with general statistics, like the number of visitors to different pages, traffic sources, and conversion rate to help us improve website performance. By disabling these cookies, we will not be able to identify you as a visitor.'
  },
  {
    id: 'advertising',
    title: 'Advertising cookie files',
    description: 'These cookies are set by our advertising partners in order to provide behavioral advertising and remarketing analytics. They collect browsing information to build user profiles and run personalized advertising. When you visit other websites, you will see customized ads based on your profile created according to your interests and behavior.'
  }
] as const;
