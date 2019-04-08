/// <reference lib="es2016"/>

import * as vinyl from 'vinyl';
import * as through from 'through2';
import * as path from 'path';

// 获取相对路径
interface IAlias {
  [key: string]: string;
}
function importAlias(alias: IAlias = {}): any {
  return through.obj((file: vinyl, _, callback) => {
    if (file.isNull()) {
      callback(undefined, file);
      return;
    }
    const aliasNames = Object.keys(alias);
    if (aliasNames.length > 0) {
      const aliasStr = aliasNames.join('|');
      const importReg = new RegExp(`import\\s*\\{?\\s*.*\\s*\\}?(?:\\s*from\\s*)?['"](${aliasStr})(?:\\/[\\w_.-]+)*['"]`, 'ig');

      let contents = file.contents.toString();
      const cwd = file.cwd;
      contents = contents.replace(importReg, (m, key) => {
        const aliasPath = path.resolve(cwd, alias[key]);
        let aliasRelative = path.relative(path.dirname(file.path), aliasPath);
        if (path.sep === '\\') {
          aliasRelative = aliasRelative.split(path.sep).join('/');
        }
        aliasRelative = /^\./.test(aliasRelative) ? aliasRelative : `./${aliasRelative}`;
        return m.replace(m, m.replace(key as string, aliasRelative));
      });
      file.contents = Buffer.from(contents);
    }

    callback(undefined, file);
  });
}

module.exports = importAlias;
export default importAlias;
