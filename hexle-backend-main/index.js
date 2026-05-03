const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./models');
const { Hex } = db;

const { add, format, parse } = require('date-fns');
const schedule = require('node-schedule');

const app = express();

// =====================
// DB INIT (SAFE FOR RENDER)
// =====================
const initDB = async () => {
	try {
		await db.sequelize.authenticate();
		console.log("DB connected");

		await db.sequelize.sync();
		console.log("DB synced");

		// ensure today's hex always exists
		await ensureHexForDate(format(new Date(), "yyyy-MM-dd"));

	} catch (err) {
		console.error("DB init error:", err);
	}
};

// =====================
// MIDDLEWARE
// =====================
app.use(cors({ origin: '*' }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =====================
// HEALTH CHECK
// =====================
app.get('/', (req, res) => {
	res.json({ status: 'ok' });
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
// ENSURE HEX EXISTS (CRITICAL FIX)
// =====================
const ensureHexForDate = async (date) => {
	let hex = await Hex.findOne({ where: { date } });

	if (!hex) {
		hex = await Hex.create({
			date,
			hex: generateHex()
		});

		console.log("Created missing hex for:", date);
	}

	return hex;
};

// =====================
// GET HEX ROUTE (FIXED)
// =====================
app.post('/api/get_hex', async (req, res) => {
	try {
		const date = req.body.date;

		if (!date) {
			return res.status(400).json({ error: 'date is required' });
		}

		const hex = await ensureHexForDate(date);

		return res.json(hex);

	} catch (err) {
		console.error('Error in /api/get_hex:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

// =====================
// DAILY MAINTENANCE (OPTIONAL)
// =====================
const createNextDayHex = async () => {
	const today = new Date();
	const nextDay = format(add(today, { days: 1 }), "yyyy-MM-dd");

	await ensureHexForDate(nextDay);
};

// =====================
// SCHEDULE JOB (SAFE)
// =====================
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = 'Etc/UTC';

schedule.scheduleJob(rule, async () => {
	try {
		await createNextDayHex();
		console.log("Daily hex generated");
	} catch (err) {
		console.error('Scheduled job error:', err);
	}
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
	await initDB();
	console.log(`Server running on port ${PORT}`);
});
