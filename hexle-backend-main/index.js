const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Hex } = require('./models');
const app = express();
const add = require('date-fns/add');
const format = require('date-fns/format');
const parse = require('date-fns/parse');
const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = 'Etc/UTC';

app.use(
	cors({
		origin: '*'
	})
);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);

app.post('api/get_hex', async (req, res) => {
	const date = req.body.date;

	const hex = await Hex.findOne({
		where: { date: date }
	});

	res.json(hex);
});

const generateHex = () => {
	var initial = Math.floor(Math.random() * 16777215)
		.toString(16)
		.toLowerCase();
	while (initial.length < 6) {
		initial = '0' + initial;
	}
	return initial;
};

const createHexes = async () => {
	Hex.findAll({
		limit: 1,
		order: [['id', 'DESC']]
	}).then(async (latestDate) => {
		const idx = 0;
		if (latestDate[0]) {
			await Hex.create({
				hex: generateHex(),
				date: format(add(new Date(parse(latestDate[0].date, 'yyyy-MM-dd', new Date())), { days: idx + 1 }), 'yyyy-MM-dd')
			});
		} else {
			await Hex.create({ hex: generateHex(), date: format(add(new Date(), { days: idx }), 'yyyy-MM-dd') });
		}
	});
};

const pruneHexes = async () => {
	Hex.findAll({
		limit: 1,
		order: [['id', 'ASC']]
	}).then(async (oldestDate) => {
		console.log(oldestDate);
		if (oldestDate[0]) {
			await Hex.destroy({
				where: {
					id: oldestDate[0].id
				}
			});
		}
	});
};

const job = schedule.scheduleJob(rule, () => {
	pruneHexes().then(createHexes());
});

app.listen(process.env.PORT || 3000);
console.log('Server running');
