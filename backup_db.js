import fs from 'fs';
if (fs.existsSync('canteen.db')) {
  fs.copyFileSync('canteen.db', 'canteen_backup.db');
  fs.unlinkSync('canteen.db');
  console.log('Database backed up and deleted to allow recreation.');
}
