"use strict";

const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const json2csv = require("json2csv");

void async function () {

	const agent = axios.create({ baseURL: "https://www.who.int" });

	let rows = [];

	for (let page = 1; page <= 10; page++) {
		const response = await agent.get(`/dg/speeches/${page}`);
		const $ = cheerio.load(response.data);
		$(".vertical-list-item").each(function () {
			const date = $(this).find(".date").text().trim();
			const topic = $(this).find("p.heading").text().trim();
			const href = $(this).find("a").attr("href");
			rows.push({ date, topic, href });
		});
	}

	console.log("There are total " + rows.length + " articles");

	for (const row of rows) {
		console.log("Running on article: " + row.topic);
		const response = await agent.get(row.href);
		const $ = cheerio.load(response.data);
		row.detail = $(".sf-detail-body-wrapper").text().trim();
	}

	const parser = new json2csv.Parser();
	const csv = parser.parse(rows);
	return fs.writeFileSync("./output.csv", csv);
	
}();
