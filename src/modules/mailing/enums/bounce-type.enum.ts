export enum BounceTypeEnum {
  HardBounce = 1,
  Transient = 2,
  Unsubscribe = 16,
  Subscribe = 32,
  AutoResponder = 64,
  AddressChange = 128,
  DnsError = 256,
  SpamNotification = 512,
  OpenRelayTest = 1024,
  Unknown = 2048,
  SoftBounce = 4096,
}
