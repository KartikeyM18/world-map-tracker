import express from "express";
import pg from "pg";

const port = 3000;
const app = express();

//Database and Password to be filled 
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "",
    password: "",
    port: 5432,
});
db.connect();

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    const data = await db.query("SELECT * FROM visited_countries;");
    let countries = [];
    data.rows.forEach(country => {
        countries.push(country.country_code);
    });
    

    res.render("index.ejs", {countries: countries, total: countries.length});
});

app.post("/add", async (req, res) => {
    const input = req.body.country;

    try {
        const data = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) = $1", [input.toLowerCase()]);
        const countryCode = data.rows[0].country_code;
        console.log(countryCode);

        try {
            
            await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
            res.redirect("/");

        } catch (err) {
            const data = await db.query("SELECT * FROM visited_countries;");
            let countries = [];
            data.rows.forEach(country => {
                countries.push(country.country_code);
            });

            res.render("index.ejs", {countries: countries, total: countries.length, error: "Country already added."});
        }

    } catch (error) {
        const data = await db.query("SELECT * FROM visited_countries;");
        let countries = [];
        data.rows.forEach(country => {
            countries.push(country.country_code);
        });

        res.render("index.ejs", {countries: countries, total: countries.length, error: "Country does not exist."});
    }

});

app.post("/delete", async (req, res) => {
    const input = req.body.country;

    try {
        const data = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) = $1 ;", [input.toLowerCase()]);
        const countryCode = data.rows[0].country_code;

        try {
            
            await db.query("DELETE FROM visited_countries WHERE country_code = $1", [countryCode]);
            res.redirect("/");

        } catch (err) {
            const data = await db.query("SELECT * FROM visited_countries;");
            let countries = [];
            data.rows.forEach(country => {
                countries.push(country.country_code);
            });

            res.render("index.ejs", {countries: countries, total: countries.length, error: "Country not added."});
        }

    } catch (error) {
        const data = await db.query("SELECT * FROM visited_countries;");
        let countries = [];
        data.rows.forEach(country => {
            countries.push(country.country_code);
        });

        res.render("index.ejs", {countries: countries, total: countries.length, error: "Country does not exist."});
    }
});

app.listen(port, () => {
    console.log(`Listening at port ${port}.`);
});