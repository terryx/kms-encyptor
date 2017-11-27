const Dexie = require('dexie')

const constructor = (spec) => {
  const db = new Dexie('keys')

  db.version(1).stores({
    keys: '++id, name, arn_key_id'
  })

  return db
}

module.exports = constructor
