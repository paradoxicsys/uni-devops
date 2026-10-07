const fs = require('node:fs');
const path = require('node:path');

// Tasks live in memory; when DATA_DIR is set (PVC mount) they are also saved to disk.
class TaskStore {
  constructor(dataDir) {
    this.file = dataDir ? path.join(dataDir, 'tasks.json') : null;
    this.tasks = [];
    if (this.file && fs.existsSync(this.file)) {
      this.tasks = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    }
  }

  isWritable() {
    if (!this.file) return true;
    try {
      fs.accessSync(path.dirname(this.file), fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  save() {
    if (this.file) fs.writeFileSync(this.file, JSON.stringify(this.tasks));
  }

  list() {
    return this.tasks;
  }

  add(title) {
    const id = this.tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    const task = { id, title, done: false };
    this.tasks.push(task);
    this.save();
    return task;
  }

  remove(id) {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.save();
    return this.tasks.length !== before;
  }
}

module.exports = { TaskStore };
