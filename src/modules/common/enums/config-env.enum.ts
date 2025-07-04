export enum ConfigEnvEnum {
  NODE_ENV = 'NODE_ENV',
  APP_PORT = 'APP_PORT',
  SENTRY_DNS = 'SENTRY_DNS',
  APP_BACKEND_URL = 'APP_BACKEND_URL',

  DB_HOST = 'DB_HOST',
  DB_PORT = 'DB_PORT',
  DB_USER = 'DB_USER',
  DB_PASSWORD = 'DB_PASSWORD',
  DB_NAME = 'DB_NAME',

  SERPNEST_JWT_SECRET_KEY = 'SERPNEST_JWT_SECRET_KEY',

  REDIS_HOST = 'REDIS_HOST',
  REDIS_PORT = 'REDIS_PORT',
  REDIS_DB = 'REDIS_DB',

  APP_FRONTEND_URL = 'APP_FRONTEND_URL',

  POSTMARK_AUTHORIZATION_TOKEN = 'POSTMARK_AUTHORIZATION_TOKEN',
  POSTMARK_API_KEY = 'POSTMARK_API_KEY',
  POSTMARK_SUPPORT_EMAIL = 'POSTMARK_SUPPORT_EMAIL',
  PASSWORD_RESET_TEMPLATE_ID = 'PASSWORD_RESET_TEMPLATE_ID',
  REGISTRATION_CONFIRMATION_TEMPLATE_ID = 'REGISTRATION_CONFIRMATION_TEMPLATE_ID',
  ACCOUNT_DELETION_REQUEST_TEMPLATE_ID = 'ACCOUNT_DELETION_REQUEST_TEMPLATE_ID',
  DELETING_ACCOUNT_TEMPLATE_ID = 'DELETING_ACCOUNT_TEMPLATE_ID',
  FINAL_CONFIRMATION_ACCOUNT_DELETED_TEMPLATE_ID = 'FINAL_CONFIRMATION_ACCOUNT_DELETED_TEMPLATE_ID',
  USER_INVITATION_TEMPLATE_ID = 'USER_INVITATION_TEMPLATE_ID',
  EXISTING_USER_INVITATION_TEMPLATE_ID = 'EXISTING_USER_INVITATION_TEMPLATE_ID',
  ACCOUNT_PERMISSION_CHANGE_NOTIFICATION_TEMPLATE_ID = 'ACCOUNT_PERMISSION_CHANGE_NOTIFICATION_TEMPLATE_ID',
  USER_HAS_BEEN_DELETED_TEMPLATE_ID = 'USER_HAS_BEEN_DELETED_TEMPLATE_ID',
  CONFIRM_YOUR_SERPNEST_EMAIL_CHANGE_REQUEST_TEMPLATE_ID = 'CONFIRM_YOUR_SERPNEST_EMAIL_CHANGE_REQUEST_TEMPLATE_ID',
  VERIFY_YOUR_NEW_EMAIL_ADDRESS_FOR_SERPNEST_TEMPLATE_ID = 'VERIFY_YOUR_NEW_EMAIL_ADDRESS_FOR_SERPNEST_TEMPLATE_ID',
  YOUR_SERPNEST_EMAIL_ADDRESS_HAS_BEEN_SUCCESSFULLY_CHANGED_TEMPLATE_ID = 'YOUR_SERPNEST_EMAIL_ADDRESS_HAS_BEEN_SUCCESSFULLY_CHANGED_TEMPLATE_ID',
  EMAIL_REPORT_TEMPLATE_ID = 'EMAIL_REPORT_TEMPLATE_ID',
  WELCOME_TEMPLATE_ID = 'WELCOME_TEMPLATE_ID',

  TRIAL_PERIOD_ENDS_ID_TEMPLATE = 'TRIAL_PERIOD_ENDS_ID_TEMPLATE',
  TRIAL_PERIOD_IS_OVER_TEMPLATE_ID = 'TRIAL_PERIOD_IS_OVER_TEMPLATE_ID',

  AWS_KEY_ID = 'AWS_KEY_ID',
  AWS_SECRET = 'AWS_SECRET',
  AWS_BUCKET_NAME = 'AWS_BUCKET_NAME',
  AWS_REGION_NAME = 'AWS_REGION_NAME',

  QUEUE_PORT = 'QUEUE_PORT',

  SUPER_ADMIN_EMAIL = 'SUPER_ADMIN_EMAIL',
  SUPER_ADMIN_PASSWORD = 'SUPER_ADMIN_PASSWORD',

  VALUE_SERP_KEY = 'VALUE_SERP_KEY',
  SERPER_API_KEY = 'SERPER_API_KEY',
  DESTINATION_ID = 'DESTINATION_ID',

  API_DOCUMENTATION_INCLUSION = 'API_DOCUMENTATION_INCLUSION',

  HTML_GENERATOR_URL = 'HTML_GENERATOR_URL',
  PUPPETEER_GENERATOR = 'PUPPETEER_GENERATOR',

  PADDLE_TOKEN = 'PADDLE_TOKEN',
  PADDLE_URL = 'PADDLE_URL',
  PADDLE_WEBHOOK_SECRET_KEY = 'PADDLE_WEBHOOK_SECRET_KEY',
  PADDLE_ENVIRONMENT = 'PADDLE_ENVIRONMENT',
  PADDLE_SELLER_ID = 'PADDLE_SELLER_ID',

  ENVIRONMENT = 'ENVIRONMENT',

  ALERT__BY_PROJECT_TEMPLATE_ID = 'ALERT__BY_PROJECT_TEMPLATE_ID',
  ALERT_BY_KEYWORDS_TEMPLATE_ID = 'ALERT_BY_KEYWORDS_TEMPLATE_ID',

  COMPANY_NAME = 'COMPANY_NAME',
  COMPANY_ADDRESS = 'COMPANY_ADDRESS',

  DATA_FOR_SEO_LOGIN = 'DATA_FOR_SEO_LOGIN',
  DATA_FOR_SEO_PASSWORD = 'DATA_FOR_SEO_PASSWORD',

  FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER = 'FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER',

  FASTIFY_BACKEND_URL = 'FASTIFY_BACKEND_URL',
  FASTIFY_PORT = 'FASTIFY_PORT',

  SERPER_SEARCH_NUMBER_OF_RESULTS = 'SERPER_SEARCH_NUMBER_OF_RESULTS',

  DB_PORT_SLAVE = 'DB_PORT_SLAVE',
  DB_PORT_MASTER = 'DB_PORT_MASTER',
  DB_HOST_MASTER = 'DB_HOST_MASTER',
  DB_HOST_SLAVE = 'DB_HOST_SLAVE',

  CRYPTO_JS_SECRET_KEY = 'CRYPTO_JS_SECRET_KEY',

  PAYPAL_PAYMENT_METHOD = 'PAYPAL_PAYMENT_METHOD',
  APPLE_PAY_PAYMENT_METHOD = 'APPLE_PAY_PAYMENT_METHOD',
  GOOGLE_PAY_PAYMENT_METHOD = 'GOOGLE_PAY_PAYMENT_METHOD',
  CARD_PAYMENT_METHOD = 'CARD_PAYMENT_METHOD',
  IDEAL_PAYMENT_METHOD = 'IDEAL_PAYMENT_METHOD',
  BANCONTACT_PAYMENT_METHOD = 'BANCONTACT_PAYMENT_METHOD',

  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_SECRET = 'GOOGLE_SECRET',
  GOOGLE_DEVELOPER_TOKEN = 'GOOGLE_DEVELOPER_TOKEN',
  GOOGLE_REFFRESH_TOKEN = 'GOOGLE_REFFRESH_TOKEN',
  GOOGLE_CUSTOMER_ID = 'GOOGLE_CUSTOMER_ID',

  RATE_LIMIT_POINTS = 'RATE_LIMIT_POINTS',

  SUPER_PASSWORD = 'SUPER_PASSWORD',

  GOOGLE_CALLBACK = 'GOOGLE_CALLBACK',
  SHOW_ADD_DISCOUNTS = 'SHOW_ADD_DISCOUNTS',

  HELP_SCOUT_SECRET_KEY = 'HELP_SCOUT_SECRET_KEY',

  YOUTUBE_API_KEY = 'YOUTUBE_API_KEY',

  GOOGLE_LOCAL_RANK_CHANGE_FOR_PROJECT_TEMPLATE = 'GOOGLE_LOCAL_RANK_CHANGE_FOR_PROJECT_TEMPLATE',
  GOOGLE_LOCAL_RANK_CHANGE_FOR_KEYWORDS_TEMPLATE = 'GOOGLE_LOCAL_RANK_CHANGE_FOR_KEYWORDS_TEMPLATE',
  GOOGLE_MAPS_RANK_CHANGE_FOR_PROJECT = 'GOOGLE_MAPS_RANK_CHANGE_FOR_PROJECT',
  GOOGLE_MAPS_RANK_CHANGE_FOR_KEYWORDS = 'GOOGLE_MAPS_RANK_CHANGE_FOR_KEYWORDS',

  DB_PORT_TEST = 'DB_PORT_TEST',
  TEST_DB = 'TEST_DB',
  TEST_DB_HOST = 'TEST_DB_HOST',

  NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_STANDARD_SEARCH_ENGINES = 'NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_STANDARD_SEARCH_ENGINES',
  NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_OTHER_SEARCH_ENGINES = 'NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_OTHER_SEARCH_ENGINES',

  DB_LOGGING = 'DB_LOGGING',
}
