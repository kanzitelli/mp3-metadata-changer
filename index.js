const fs = require('fs');
const path = require('path');
const ID3Writer = require('browser-id3-writer');
const parseTitle = require('./parseTitle').default;

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

const pathJoin = p => path.resolve(process.cwd(), p);

const songsDir = myArgs[0] || 'songs';
const songsDirNew = songsDir + '_new';
// const dir = path.join(__dirname, songsDir);
// const dirNew = path.join(__dirname, songsDirNew);
const dir = pathJoin(songsDir);
const dirNew = pathJoin(songsDirNew);

if (!fs.existsSync(dirNew)){
  fs.mkdirSync(dirNew);
}

const start = async () => {
  console.log('Starting...');
  console.log();

  const files = fs.readdirSync(dir);
  console.log("Количество файлов:", files.length);

  for (const f of files) {
    let razbor = f.split('.');

    const ext = razbor.pop();
    const name = razbor.join('');

    if (ext === 'mp3') {
      const parsedTitle = await parseTitle(name);

      const artist = parsedTitle.artist;
      const song = parsedTitle.title;
      const newFileName = `${artist} - ${song}.${ext}`;

      const songFile = fs.readFileSync(path.join(dir, f));
      const writer = new ID3Writer(songFile);
      writer.setFrame('TIT2', song)
            .setFrame('TPE1', [artist]);
      writer.addTag();

      const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
      fs.writeFileSync(path.join(dirNew, newFileName), taggedSongBuffer);
      console.log(artist, '-', song);
    }
  }

  console.log();
  console.log('Done :)');
}

start();