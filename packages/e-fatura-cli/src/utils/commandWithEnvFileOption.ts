import * as path from 'node:path';
import { createOption, type Command } from 'commander';

export interface CommandWithEnvFileOption {
  readonly envFile: string;
}

function commandWithEnvFileOption(command: Command): Command {
  const envFileOption = createOption(
    '--env-file [file]',
    'e-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu'
  ).default(path.resolve('.env'));

  return command.addOption(envFileOption).hook('preAction', (thisCommand) => {
    const envFilePath = thisCommand.getOptionValue(
      envFileOption.attributeName()
    ) as string;

    thisCommand.setOptionValue(
      envFileOption.attributeName(),
      path.resolve(envFilePath)
    );
  });
}

export default commandWithEnvFileOption;
