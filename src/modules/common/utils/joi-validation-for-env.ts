import * as Joi from 'joi';

/**
 * EnvValidationSchema validates environment variables required for the application configuration.
 *
 * The schema ensures the presence and correct type of various environment variables like:
 * - `NODE_ENV`: Environment the application is running in (e.g., development, testing, production)
 * - `APP_PORT`: Port number the application listens on
 * - `APP_BACKEND_URL`: URL of the backend service
 * - `DB_HOST`: Database host
 * - `DB_USER`: Database user
 * - `DB_PORT`: Database port
 * - `DB_PASSWORD`: Database user password
 * - `DB_NAME`: Database name
 * - `SERPNEST_JWT_SECRET_KEY`: JWT secret key for SERPNEST
 * - `REDIS_HOST`: Redis server host
 * - `REDIS_PORT`: Redis server port
 * - `REDIS_DB`: Redis database number
 * - `EMAIL`: Email address for communication
 * - `POSTMARK_SUPPORT_EMAIL`: Postmark support email
 * - `POSTMARK_API_KEY`: Postmark API key
 * - `QUEUE_PORT`: Queue service port
 * - `APP_FRONTEND_URL`: URL of the frontend application
 * - `AWS_KEY_ID`: AWS key ID
 * - `AWS_SECRET`: AWS secret key
 * - `AWS_BUCKET_NAME`: AWS S3 bucket name
 * - `AWS_REGION_NAME`: AWS region name
 * - Several template IDs for email notifications
 * - `VALUE_SERP_KEY`: SERP API key
 * - `DESTINATION_ID`: Destination ID for API
 * - `API_DOCUMENTATION_INCLUSION`: Flag to include API documentation
 * - `SERPER_API_KEY`: SERPer API key
 * - `HTML_GENERATOR_URL`: URL for HTML generation service
 * - `PUPPETEER_GENERATOR`: Puppeteer generator service configuration
 * - `PADDLE_TOKEN`: Paddle API token
 * - `PADDLE_URL`: Paddle API URL
 * - Different package IDs for Paddle integrations
 * - `ENVIRONMENT`: Application environment
 * - Company info variables like `COMPANY_NAME` and `COMPANY_ADDRESS`
 * - `DATA_FOR_SEO_LOGIN`: Login credential for DataForSEO
 * - `DATA_FOR_SEO_PASSWORD`: Password for DataForSEO
 * - Various limits and configuration for rank checking and search engines
 * - `DB_PORT_SLAVE`: Database slave port
 * - `DB_PORT_MASTER`: Database master port
 * - `CRYPTO_JS_SECRET_KEY`: Secret key for CryptoJS
 * - Payment methods configurations like `PAYPAL_PAYMENT_METHOD`, `GOOGLE_PAY_PAYMENT_METHOD`, etc.
 * - Google API configurations like `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET`, and related keys and tokens
 * - New Relic configurations like `NEW_RELIC_APP_NAME`, `NEW_RELIC_LICENSE_KEY`, etc.
 * - Rate limit configuration
 * - Test database configurations
 * - Flags for features like `SHOW_ADD_DISCOUNTS`
 * - `HELP_SCOUT_SECRET_KEY`: Key for Help Scout integration
 * - `YOUTUBE_API_KEY`: API key for YouTube
 * - Rank change notification template IDs for Google Maps and Local
 *
 * This schema ensures that all these environment variables are provided and are of the correct type to avoid misconfigurations.
 */
export const EnvValidationSchema = Joi.object().keys({
  NODE_ENV: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  APP_BACKEND_URL: Joi.string().required(),
  APP_MAX_IMAGE_FILE_SIZE: Joi.number().required(),
  SUPER_ADMIN_EMAIL: Joi.string().required(),
  SUPER_ADMIN_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  SERPNEST_JWT_SECRET_KEY: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_DB: Joi.number().required(),

  EMAIL: Joi.string().required(),
  POSTMARK_SUPPORT_EMAIL: Joi.string().required(),
  POSTMARK_API_KEY: Joi.string().required(),
  QUEUE_PORT: Joi.number().required(),
  APP_FRONTEND_URL: Joi.string().required(),
  AWS_KEY_ID: Joi.string().required(),
  AWS_SECRET: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
  AWS_REGION_NAME: Joi.string().required(),
  PASSWORD_RESET_TEMPLATE_ID: Joi.number().required(),
  REGISTRATION_CONFIRMATION_TEMPLATE_ID: Joi.number().required(),
  ACCOUNT_DELETION_REQUEST_TEMPLATE_ID: Joi.number().required(),
  DELETING_ACCOUNT_TEMPLATE_ID: Joi.number().required(),
  FINAL_CONFIRMATION_ACCOUNT_DELETED_TEMPLATE_ID: Joi.number().required(),
  USER_INVITATION_TEMPLATE_ID: Joi.number().required(),
  EXISTING_USER_INVITATION_TEMPLATE_ID: Joi.number().required(),
  ACCOUNT_PERMISSION_CHANGE_NOTIFICATION_TEMPLATE_ID: Joi.number().required(),
  USER_HAS_BEEN_DELETED_TEMPLATE_ID: Joi.number().required(),
  EMAIL_REPORT_TEMPLATE_ID: Joi.number().required(),
  TRIAL_PERIOD_ENDS_ID_TEMPLATE: Joi.number().required(),
  TRIAL_PERIOD_IS_OVER_TEMPLATE_ID: Joi.number().required(),
  CONFIRM_YOUR_SERPNEST_EMAIL_CHANGE_REQUEST_TEMPLATE_ID:
    Joi.number().required(),
  VERIFY_YOUR_NEW_EMAIL_ADDRESS_FOR_SERPNEST_TEMPLATE_ID:
    Joi.number().required(),
  YOUR_SERPNEST_EMAIL_ADDRESS_HAS_BEEN_SUCCESSFULLY_CHANGED_TEMPLATE_ID:
    Joi.number().required(),
  VALUE_SERP_KEY: Joi.string().required(),
  DESTINATION_ID: Joi.string().required(),
  API_DOCUMENTATION_INCLUSION: Joi.boolean().required(),
  SERPER_API_KEY: Joi.string().required(),
  HTML_GENERATOR_URL: Joi.string().required(),
  PUPPETEER_GENERATOR: Joi.string().required(),
  PADDLE_TOKEN: Joi.string().required(),
  PADDLE_URL: Joi.string().required(),
  PADDLE_ENVIRONMENT: Joi.string().valid('sandbox', 'production').required(),
  PADDLE_WEBHOOK_SECRET_KEY: Joi.string().required(),
  PADDLE_SELLER_ID: Joi.number().required(),
  ANNUAL_STARTER_PACKAGE_ID: Joi.string().required(),
  ANNUAL_PROFESSIONAL_PACKAGE_ID: Joi.string().required(),
  ANNUAL_ENTERPRISE_PACKAGE_ID: Joi.string().required(),
  ANNUAL_CUSTOM_1_PACKAGE_ID: Joi.string().required(),
  ANNUAL_CUSTOM_2_PACKAGE_ID: Joi.string().required(),
  ANNUAL_CUSTOM_3_PACKAGE_ID: Joi.string().required(),
  ANNUAL_CUSTOM_4_PACKAGE_ID: Joi.string().required(),
  ANNUAL_CUSTOM_5_PACKAGE_ID: Joi.string().required(),
  ENVIRONMENT: Joi.string()
    .valid('development', 'testing', 'production', 'staging')
    .required(),
  STARTER_PACKAGE_ID: Joi.string().required(),
  PROFESSIONAL_PACKAGE_ID: Joi.string().required(),
  ENTERPRISE_PACKAGE_ID: Joi.string().required(),
  CUSTOM_1_PACKAGE_ID: Joi.string().required(),
  CUSTOM_2_PACKAGE_ID: Joi.string().required(),
  CUSTOM_3_PACKAGE_ID: Joi.string().required(),
  CUSTOM_4_PACKAGE_ID: Joi.string().required(),
  CUSTOM_5_PACKAGE_ID: Joi.string().required(),
  ALERT_BY_KEYWORDS_TEMPLATE_ID: Joi.number().required(),
  ALERT__BY_PROJECT_TEMPLATE_ID: Joi.number().required(),

  WELCOME_TEMPLATE_ID: Joi.number().required(),

  COMPANY_NAME: Joi.string().required(),
  COMPANY_ADDRESS: Joi.string().required(),
  DATA_FOR_SEO_LOGIN: Joi.string().required(),
  DATA_FOR_SEO_PASSWORD: Joi.string().required(),

  FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER: Joi.number().required(),
  FASTIFY_BACKEND_URL: Joi.string().required(),
  FASTIFY_PORT: Joi.number().required(),

  SERPER_SEARCH_NUMBER_OF_RESULTS: Joi.number().required(),

  DB_PORT_SLAVE: Joi.number().required(),
  DB_PORT_MASTER: Joi.number().required(),
  DB_HOST_MASTER: Joi.string().required(),
  DB_HOST_SLAVE: Joi.string().required(),

  CRYPTO_JS_SECRET_KEY: Joi.string().required(),
  PAYPAL_PAYMENT_METHOD: Joi.boolean().required(),
  GOOGLE_PAY_PAYMENT_METHOD: Joi.boolean().required(),
  CARD_PAYMENT_METHOD: Joi.boolean().required(),
  IDEAL_PAYMENT_METHOD: Joi.boolean().required(),
  BANCONTACT_PAYMENT_METHOD: Joi.boolean().required(),
  APPLE_PAY_PAYMENT_METHOD: Joi.boolean().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_SECRET: Joi.string().required(),
  GOOGLE_DEVELOPER_TOKEN: Joi.string().required(),
  GOOGLE_REFFRESH_TOKEN: Joi.string().required(),
  GOOGLE_CUSTOMER_ID: Joi.string().required(),
  NEW_RELIC_APP_NAME: Joi.string().required(),
  NEW_RELIC_LICENSE_KEY: Joi.string().required(),
  NEW_RELIC_DISTRIBUTED_TRACING_ENABLED: Joi.boolean().required(),
  NEW_RELIC_LOG: Joi.string().required(),
  NEW_RELIC_AI_MONITORING_ENABLED: Joi.boolean().required(),
  NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_MAX_SAMPLES_STORED: Joi.string().required(),
  NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED: Joi.string().required(),
  RATE_LIMIT_POINTS: Joi.number().required(),
  SUPER_PASSWORD: Joi.string().required(),
  GOOGLE_CALLBACK: Joi.string().required(),
  SHOW_ADD_DISCOUNTS: Joi.boolean().required(),
  HELP_SCOUT_SECRET_KEY: Joi.string().required(),
  YOUTUBE_API_KEY: Joi.string().required(),
  GOOGLE_LOCAL_RANK_CHANGE_FOR_PROJECT_TEMPLATE: Joi.number().required(),
  GOOGLE_LOCAL_RANK_CHANGE_FOR_KEYWORDS_TEMPLATE: Joi.number().required(),
  GOOGLE_MAPS_RANK_CHANGE_FOR_PROJECT: Joi.number().required(),
  GOOGLE_MAPS_RANK_CHANGE_FOR_KEYWORDS: Joi.number().required(),

  DB_PORT_TEST: Joi.number().required(),
  TEST_DB: Joi.string().required(),
  TEST_DB_HOST: Joi.string().required(),

  NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_STANDARD_SEARCH_ENGINES:
    Joi.number().required(),
  NUMBER_OF_KEYWORDS_USING_LIVE_MODE_FOR_OTHER_SEARCH_ENGINES:
    Joi.number().required(),
  DB_LOGGING: Joi.boolean().required(),

  POSTMARK_AUTHORIZATION_TOKEN: Joi.string().required(),
});
