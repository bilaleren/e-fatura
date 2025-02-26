import { spawn } from 'child_process';

export interface XsltprocOptions {
  /**
   * XSLT şablonunun isim parametresine değer değerini aktarmakta kullanılır En fazla 32
   çift isim/değer çifti aktarabilirsiniz. Şayet verilen değer bir düğüm tanımlayıcısı
   değil de bir dizge ise, **stringParams** seçeneğini kullanmak daha uygundur.
   @default {}
   */
  params?: Record<string, string | number>;

  /**
   * Değerin bir düğüm tanımlayıcısı değil de bir dizge olduğu durumlarda, XSLT
   şablonunun isim parametresine değer değerini aktarmakta kullanılır. Dizge mutlaka
   UTF-8 kodlanmış olmalıdır.
   * @default {}
   */
  stringParams?: Record<string, string | number>;

  /**
   * `xsltproc` komut satırı uygulamasının çalıştırılabilir dosya yolu.
   * @default /usr/bin/xsltproc
   */
  xsltprocExecutablePath?: string;
}

function paramsToArgs(
  params: Record<string, string | number>,
  name: string
): string[] {
  const args: string[] = [];

  for (const key in params) {
    args.push(`--${name}`, key, `${params[key]}`);
  }

  return args;
}

function xsltproc(
  args: readonly string[],
  options?: XsltprocOptions
): Promise<Buffer> {
  const {
    params = {},
    stringParams = {},
    xsltprocExecutablePath = '/usr/bin/xsltproc'
  } = options || {};

  return new Promise<Buffer>((resolve, reject) => {
    const cmd = spawn(
      xsltprocExecutablePath,
      [
        ...paramsToArgs(params, 'param'),
        ...paramsToArgs(stringParams, 'stringparam'),
        ...args
      ],
      {
        env: process.env,
        shell: process.platform === 'win32'
      }
    );
    const chunks: Buffer[] = [];

    cmd.on('error', (err: Error) => {
      reject(err);
    });

    cmd.stdout.on('data', (data: string | Buffer) => {
      chunks.push(Buffer.from(data));
    });

    cmd.stdout.on('close', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

export default xsltproc;
