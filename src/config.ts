import { ConfigFramework } from '@book000/node-utils'

interface Configuration {
  discordWebhookUrl: string
  targets: string[]
}

export class MelonBooksCheckConfiguration extends ConfigFramework<Configuration> {
  protected validates(): Record<string, (config: Configuration) => boolean> {
    return {
      'discordWebhookUrl is required': (config: Configuration) =>
        'discordWebhookUrl' in config,
      'discordWebhookUrl must be a string': (config: Configuration) =>
        typeof config.discordWebhookUrl === 'string',
      'targets is required': (config: Configuration) => 'targets' in config,
      'targets must be an array': (config: Configuration) =>
        Array.isArray(config.targets),
      'targets must not be empty': (config: Configuration) =>
        config.targets.length > 0,
      'targets must be an array of strings': (config: Configuration) =>
        config.targets.every((target) => typeof target === 'string'),
    }
  }
}
