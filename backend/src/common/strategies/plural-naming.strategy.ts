import pluralize from 'pluralize';
import { DefaultNamingStrategy, type NamingStrategyInterface } from 'typeorm';

export class PluralNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ?? pluralize(super.tableName(targetName, undefined));
  }
}
