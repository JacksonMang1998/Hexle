const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Hex } = require('./models');

const add = require('date-fns/add');
const format = require('date-fns/format');
const parse = require('date-fns/parse');
const schedule = require('node-schedule');

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors({ origin: '*' }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =====================
// HEALTH CHECK (important for Render)
// =====================
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// =====================
// GET HEX ROUTE (FIXED PATH)
// =====================
app.post('/api/get_hex', async (req, res) => {
  try {
    const date = req.body.date;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const hex = await Hex.findOne({
      where: { date }
    });

    return res.json(hex);
  } catch (err) {
    console.error('Error in /api/get_hex:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// =====================
// HEX GENERATOR
// =====================
const generateHex = () => {
  let initial = Math.floor(Math.random() * 16777215)
    .toString(16)
    .toLowerCase();

  while (initial.length < 6) {
    initial = '0' + initial;
  }

  return initial;
};

// =====================
// CREATE HEX ENTRY
// =====================
const createHexes = async () => {
  try {
    const latestDate = await Hex.findAll({
      limit: 1,
      order: [['id', 'DESC']]
    });

    const idx = 0;

    if (latestDate[0]) {
      const nextDate = format(
        add(
          new Date(parse(latestDate[0].date, 'yyyy-MM-dd', new Date())),
          { days: idx + 1 }
        ),
        'yyyy-MM-dd'
      );

      await Hex.create({
        hex: generateHex(),
        date: nextDate
      });
    } else {
      await Hex.create({
        hex: generateHex(),
        date: format(add(new Date(), { days: idx }), 'yyyy-MM-dd')
      });
    }
  } catch (err) {
    console.error('Error in createHexes:', err);
  }
};

// =====================
// PRUNE OLD HEXES
// =====================
const pruneHexes = async () => {
  try {
    const oldestDate = await Hex.findAll({
      limit: 1,
      order: [['id', 'ASC']]
    });

    if (oldestDate[0]) {
      await Hex.destroy({
        where: { id: oldestDate[0].id }
      });
    }
  } catch (err) {
    console.error('Error in pruneHexes:', err);
  }
};

// =====================
// SCHEDULE JOB (SAFE VERSION)
// =====================
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = 'Etc/UTC';

schedule.scheduleJob(rule, async () => {
  try {
    await pruneHexes();
    await createHexes();
  } catch (err) {
    console.error('Scheduled job error:', err);
  }
});

// =====================
// START SERVER (Render SAFE)
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
