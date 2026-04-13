const db = require('../config/db');

const baseController = (table) => {

  return {

    // get all
    getAll: async (req, res) => {
      try {
        const result = await db.query(`select * from ${table} order by id asc`);
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // get by id
    getById: async (req, res) => {
      const { id } = req.params;

      try {
        const result = await db.query(
          `select * from ${table} where id = $1`,
          [id]
        );
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // create (dynamic)
    create: async (req, res) => {
      const data = req.body;

      const keys = Object.keys(data);
      const values = Object.values(data);

      const columns = keys.join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      try {
        const result = await db.query(
          `insert into ${table} (${columns})
           values (${placeholders}) returning *`,
          values
        );

        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // update (dynamic)
    update: async (req, res) => {
      const { id } = req.params;
      const data = req.body;

      const keys = Object.keys(data);
      const values = Object.values(data);

      const setQuery = keys
        .map((key, i) => `${key} = $${i + 1}`)
        .join(', ');

      try {
        await db.query(
          `update ${table} set ${setQuery} where id = $${keys.length + 1}`,
          [...values, id]
        );

        res.json({ message: 'updated' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // delete
    delete: async (req, res) => {
      const { id } = req.params;

      try {
        await db.query(
          `delete from ${table} where id = $1`,
          [id]
        );

        res.json({ message: 'deleted' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }

  };
};

module.exports = baseController;